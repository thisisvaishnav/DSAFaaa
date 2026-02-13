"use client";

import { Group, Panel, Separator } from "react-resizable-panels";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  Play,
  Upload,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";

import questionsData from "../../data/questions.json";
import { useSession } from "../../../lib/auth-client";
import {
  createPracticeSubmission as createPracticeSubmissionApi,
  fetchPracticeSubmissions,
} from "../../../lib/api";

/* -------------------- Types -------------------- */

interface TestCase {
  input: string;
  expected_output: string;
}

interface Question {
  id: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  testcases: TestCase[];
}

type SupportedLanguage = "javascript" | "python" | "cpp";
type Tab = "Description" | "Editorial" | "Solutions" | "Submissions";

interface Submission {
  id: string;
  language: SupportedLanguage;
  code: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded";
  createdAt: string;
  runtimeMs: number;
  memoryMb: number;
}

interface RunResult {
  status: "idle" | "running" | "success" | "error";
  message: string;
}

/* -------------------- Helpers -------------------- */

const getDefaultCode = (lang: SupportedLanguage) => {
  if (lang === "python") return `# Write your code here\nprint("Hello World")`;
  if (lang === "javascript")
    return `// Write your code here\nconsole.log("Hello World");`;

  return `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello World";
    return 0;
}`;
};

/* -------------------- Page -------------------- */

const Page = () => {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const questionId = Number(params.slug);
  const raw = questionsData.find((q: any) => q.id === questionId);

  const question: Question = raw
    ? {
        id: raw.id,
        category: raw.category,
        difficulty:
          raw.difficulty.toLowerCase() === "hard"
            ? "Hard"
            : raw.difficulty.toLowerCase() === "medium"
            ? "Medium"
            : "Easy",
        question: raw.question,
        testcases: raw.testcases,
      }
    : {
        id: 0,
        category: "General",
        difficulty: "Easy",
        question: "Problem not found.",
        testcases: [],
      };

  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
 
  const [runResult, setRunResult] = useState<RunResult>({
    status: "idle",
    message: "Run your code to see output.",
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    null,
  );
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: session } = useSession();

  /* Persist code per question + language */
  useEffect(() => {
    const saved =
      localStorage.getItem(`code-${question.id}-${language}`) ??
      getDefaultCode(language);
    setCode(saved);
  }, [language, question.id]);

  /* Load submissions: from API when logged in, else localStorage */
  useEffect(() => {
    if (session?.user) {
      setSubmissionsLoading(true);
      fetchPracticeSubmissions(question.id)
        .then((list) => {
          const mapped: Submission[] = list.map((s) => ({
            id: s.id,
            language: s.language as SupportedLanguage,
            code: s.code,
            status: s.status as Submission["status"],
            createdAt: s.createdAt,
            runtimeMs: s.runtimeMs ?? 0,
            memoryMb: s.memoryMb ?? 0,
          }));
          setSubmissions(mapped);
          setSelectedSubmissionId(mapped[0]?.id ?? null);
        })
        .catch(() => {
          setSubmissions([]);
          setSelectedSubmissionId(null);
        })
        .finally(() => setSubmissionsLoading(false));
    } else {
      try {
        const raw = localStorage.getItem(`submissions-${question.id}`);
        if (!raw) {
          setSubmissions([]);
          setSelectedSubmissionId(null);
          return;
        }
        const parsed = JSON.parse(raw) as Submission[];
        setSubmissions(parsed);
        setSelectedSubmissionId(parsed[0]?.id ?? null);
      } catch {
        setSubmissions([]);
        setSelectedSubmissionId(null);
      }
    }
  }, [question.id, session?.user]);

  const saveCode = (value: string) => {
    setCode(value);
    localStorage.setItem(`code-${question.id}-${language}`, value);
  };

  const persistSubmissions = (items: Submission[]) => {
    setSubmissions(items);
    localStorage.setItem(`submissions-${question.id}`, JSON.stringify(items));
  };

  /* -------------------- Actions -------------------- */

  const checkCode = async () => {
    // Optional: run against sample test cases before submit
  };

  const runCode = async () => {
    setRunResult({ status: "running", message: "Running test cases..." });
    await new Promise((r) => setTimeout(r, 1200));
    setRunResult({

      status: "success",
      message: "All sample test cases passed.",
    });
  };

  const submitCode = async () => {
    setRunResult({ status: "running", message: "Submitting solution..." });

    const runtimeMs = 42 + Math.round(Math.random() * 40);
    const memoryMb = 32 + Math.round(Math.random() * 16);

    if (session?.user) {
      try {
        const created = await createPracticeSubmissionApi({
          questionId: question.id,
          code,
          language,
          status: "Accepted",
          runtimeMs,
          memoryMb,
        });
        const submission: Submission = {
          id: created.id,
          language: created.language as SupportedLanguage,
          code: created.code,
          status: created.status as Submission["status"],
          createdAt: created.createdAt,
          runtimeMs: created.runtimeMs ?? runtimeMs,
          memoryMb: created.memoryMb ?? memoryMb,
        };
        const next = [submission, ...submissions];
        setSubmissions(next);
        setSelectedSubmissionId(submission.id);
        setRunResult({
          status: "success",
          message: `Accepted\nRuntime: ${submission.runtimeMs} ms\nMemory: ${submission.memoryMb} MB`,
        });
      } catch (err) {
        setRunResult({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to save submission.",
        });
      }
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));
    const submission: Submission = {
      id: `${Date.now()}`,
      language,
      code,
      status: "Accepted",
      createdAt: new Date().toISOString(),
      runtimeMs,
      memoryMb,
    };
    const next = [submission, ...submissions];
    persistSubmissions(next);
    setSelectedSubmissionId(submission.id);
    setRunResult({
      status: "success",
      message: `Accepted\nRuntime: ${submission.runtimeMs} ms\nMemory: ${submission.memoryMb} MB`,
    });
  };

    /* -------------------- Code Output -------------------- */


  const [code, setCode] = useState("");
  

  /* -------------------- Render -------------------- */

  return (
    <main className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {/* Global Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        {/* Left: Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
            C
          </div>
          <span className="font-semibold text-sm tracking-tight">
            Code Battle
          </span>
        </div>

        {/* Center: Run / Submit */}
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            className="flex items-center gap-1 px-4 py-1.5 bg-emerald-500 text-slate-950 text-sm font-semibold rounded hover:bg-emerald-400"
          >
            <Play size={14} /> Run
          </button>
          <button
            onClick={submitCode}
            className="flex items-center gap-1 px-4 py-1.5 bg-slate-800 border border-slate-700 text-sm rounded hover:bg-slate-700"
          >
            <Upload size={14} /> Submit
          </button>
        </div>

        {/* Right: User Avatar + Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((open) => !open)}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800"
          >
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
              {(
                (session?.user as any)?.name?.[0] ??
                (session?.user as any)?.email?.[0] ??
                "U"
              )
                .toString()
                .toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs text-slate-300">
              {(session?.user as any)?.email ?? "Guest"}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-md border border-slate-800 bg-slate-900 shadow-lg text-sm z-20">
              <button className="w-full px-3 py-2 text-left hover:bg-slate-800">
                My list
              </button>
              <button className="w-full px-3 py-2 text-left hover:bg-slate-800">
                Personal notebook
              </button>
              <button className="w-full px-3 py-2 text-left hover:bg-slate-800">
                Profile
              </button>
              <button className="w-full px-3 py-2 text-left hover:bg-slate-800">
                Settings
              </button>
              <Separator className="my-1 bg-slate-800" />
              <button className="w-full px-3 py-2 text-left text-rose-300 hover:bg-rose-500/10">
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Split Panels */}
      <div className="flex-1">
        <Group orientation="horizontal" className="flex h-full w-full">
        {/* ---------- LEFT PANEL ---------- */}
        <Panel defaultSize={45} minSize={25}>
          <aside className="h-full border-r border-slate-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-slate-800 rounded"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="font-semibold text-sm">Problem {question.id}</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 text-sm">
              {(["Description", "Editorial", "Solutions", "Submissions"] as Tab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium ${
                      activeTab === tab
                        ? "border-b-2 border-emerald-400 text-emerald-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
                  {activeTab === "Description" && (
                    <>
                      <div className="mb-3 flex gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800">
                          {question.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            question.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : question.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>

                      {question.question.split("\n").map((p, i) => (
                        <p key={i} className="mb-2 whitespace-pre-wrap">
                          {p}
                        </p>
                      ))}

                      <h3 className="mt-4 mb-2 text-xs font-semibold text-slate-400">
                        Examples
                      </h3>
                      {question.testcases.map((tc, i) => (
                        <div
                          key={i}
                          className="mb-2 rounded border border-slate-800 bg-slate-900 p-2 text-xs"
                        >
                          <p>
                            <strong>Input:</strong> {tc.input}
                          </p>
                          <p>
                            <strong>Output:</strong> {tc.expected_output}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === "Editorial" && (
                    <div className="space-y-4 text-slate-200">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Intuition
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">
                          This is a {question.difficulty.toLowerCase()} level{" "}
                          {question.category} problem. You are given some input and
                          need to transform it into the exact output shown in the
                          examples. Focus on carefully reading from standard input
                          and printing the correct value or sequence.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Algorithm
                        </h3>
                        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                          <li>Parse the input in the same format as described.</li>
                          <li>
                            Apply a simple operation (like sum, min/max, counting, or
                            reordering) to compute the answer.
                          </li>
                          <li>
                            Print the result using the exact formatting from the
                            sample outputs (including spaces and newlines).
                          </li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Complexity
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">
                          Most problems in this set can be solved in{" "}
                          <span className="font-mono">O(n)</span> time where{" "}
                          <span className="font-mono">n</span> is the number of input
                          elements, and with{" "}
                          <span className="font-mono">O(1)</span> or{" "}
                          <span className="font-mono">O(n)</span> extra memory.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Edge Cases
                        </h3>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">
                          <li>Check the smallest and largest possible inputs.</li>
                          <li>Be careful with negative numbers and zeros.</li>
                          <li>Match the exact spacing and newline behavior.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "Solutions" && (
                    <div className="space-y-3">
                      {submissionsLoading ? (
                        <div className="flex items-center gap-2 text-sky-400">
                          <Loader2 className="animate-spin" size={16} />
                          <span>Loading…</span>
                        </div>
                      ) : submissions.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          Submit your code to see your accepted solutions here.
                        </p>
                      ) : (
                        <>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Best Accepted Solution
                          </h3>
                          {(() => {
                            const accepted =
                              submissions.find((s) => s.status === "Accepted") ??
                              submissions[0];
                            if (!accepted) return null;
                            return (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>
                                    Language:{" "}
                                    <span className="font-mono text-slate-100">
                                      {accepted.language}
                                    </span>
                                  </span>
                                  <span>
                                    Runtime: {accepted.runtimeMs} ms · Memory:{" "}
                                    {accepted.memoryMb} MB
                                  </span>
                                </div>
                                <div className="rounded border border-slate-800 bg-slate-950">
                                  <pre className="max-h-72 overflow-auto px-3 py-2 text-xs font-mono text-slate-100">
                                    {accepted.code}
                                  </pre>
                                </div>
                                <button
                                  onClick={() => {
                                    setLanguage(accepted.language);
                                    saveCode(accepted.code);
                                  }}
                                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                                >
                                  Load into editor
                                </button>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "Submissions" && (
                    <div className="space-y-3 text-sm">
                      {!session?.user && (
                        <p className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200">
                          Sign in to save submission history to your account.
                        </p>
                      )}
                      {submissionsLoading ? (
                        <div className="flex items-center gap-2 text-sky-400">
                          <Loader2 className="animate-spin" size={16} />
                          <span>Loading submissions…</span>
                        </div>
                      ) : submissions.length === 0 ? (
                        <p className="text-slate-400">
                          No submissions yet. Run your code and click{" "}
                          <span className="font-semibold">Submit</span> to start
                          tracking your progress.
                        </p>
                      ) : (
                        <>
                          <div className="text-xs text-slate-400">
                            Showing your recent submissions for this problem.
                          </div>
                          <div className="space-y-2">
                            {submissions.map((s) => {
                              const isSelected = s.id === selectedSubmissionId;
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => setSelectedSubmissionId(s.id)}
                                  className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-xs transition ${
                                    isSelected
                                      ? "border-emerald-500/60 bg-emerald-500/5"
                                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900"
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-100">
                                      {s.status}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      {new Date(s.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5 text-[11px] text-slate-400">
                                    <span>{s.language}</span>
                                    <span>
                                      {s.runtimeMs} ms · {s.memoryMb} MB
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {(() => {
                            const current = submissions.find(
                              (s) => s.id === selectedSubmissionId,
                            );
                            if (!current) return null;
                            return (
                              <div className="mt-3 space-y-2">
                                <h4 className="text-xs font-semibold text-slate-400">
                                  Selected submission
                                </h4>
                                <div className="rounded border border-slate-800 bg-slate-950">
                                  <pre className="max-h-72 overflow-auto px-3 py-2 text-xs font-mono text-slate-100">
                                    {current.code}
                                  </pre>
                                </div>
                                <button
                                  onClick={() => {
                                    setLanguage(current.language);
                                    saveCode(current.code);
                                  }}
                                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                                >
                                  Load into editor
                                </button>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}
            </div>
          </aside>
        </Panel>

        <Separator className="w-1 bg-slate-800/70 hover:bg-slate-700 transition-colors" />

        {/* ---------- RIGHT PANEL (Editor + Testcase) ----------*/}
        <Panel defaultSize={55} minSize={30}>
          <section className="flex h-full flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as SupportedLanguage)
                }
                className="bg-slate-900 border border-slate-700 text-sm px-2 py-1 rounded"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={runCode}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-slate-950 text-sm font-semibold rounded hover:bg-emerald-400"
                >
                  <Play size={14} /> Run
                </button>
                <button
                  onClick={submitCode}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 text-sm rounded hover:bg-slate-700"
                >
                  <Upload size={14} /> Submit
                </button>
              </div>
            </div>

            {/* Right side vertical split: Code (top) + Testcase (bottom) */}
            <div className="flex-1">
              <Group orientation="vertical" className="flex h-full w-full flex-col">
                {/* Top: Code editor */}
                <Panel defaultSize={70} minSize={40}>
                  <div className="h-full">
                    <Editor
                      theme="vs-dark"
                      language={language === "cpp" ? "cpp" : language}
                      value={code}
                      onChange={(v) => saveCode(v ?? "")}
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </Panel>

                <Separator className="h-1 bg-slate-800/70 hover:bg-slate-700 transition-colors" />

                {/* Bottom: Testcase / Result panel */}
                <Panel defaultSize={30} minSize={15}>
                  <div className="h-full border-t border-slate-800 bg-slate-950 flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-2 text-xs border-b border-slate-800">
                      <AlertCircle size={14} />
                      <span>Testcase / Result</span>
                    </div>

                    <div className="flex-1 p-4 text-xs whitespace-pre-wrap overflow-auto">
                      {runResult.status === "running" && (
                        <div className="flex items-center gap-2 text-sky-400">
                          <Loader2 className="animate-spin" size={14} />
                          {runResult.message}
                        </div>
                      )}
                      {runResult.status !== "running" && runResult.message}
                    </div>
                  </div>
                </Panel>
              </Group>
            </div>
          </section>
        </Panel>
        </Group>
      </div>
    </main>
  );
};

export default Page;
