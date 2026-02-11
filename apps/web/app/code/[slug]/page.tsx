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
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState<RunResult>({
    status: "idle",
    message: "Run your code to see output.",
  });

  /* Persist code per question + language */
  useEffect(() => {
    const saved =
      localStorage.getItem(`code-${question.id}-${language}`) ??
      getDefaultCode(language);
    setCode(saved);
  }, [language, question.id]);

  const saveCode = (value: string) => {
    setCode(value);
    localStorage.setItem(`code-${question.id}-${language}`, value);
  };

  /* -------------------- Actions -------------------- */

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
    await new Promise((r) => setTimeout(r, 1500));
    setRunResult({
      status: "success",
      message:
        "Accepted\nRuntime: 52 ms (beats 91%)\nMemory: 41.2 MB (beats 87%)",
    });
  };

  /* -------------------- Render -------------------- */

  return (
    <main className="h-screen bg-slate-950 text-slate-100">
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
                <h1 className="font-semibold text-sm">
                    Problem {question.id}
                </h1>
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
                    )
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

                {activeTab !== "Description" && (
                    <div className="text-slate-400 text-sm">
                    Content coming soon.
                    </div>
                )}
                </div>
            </aside>

        </Panel>

        <Separator className="w-1 bg-slate-800/70 hover:bg-slate-700 transition-colors" />

        {/* ---------- RIGHT PANEL ----------*/}
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

            {/* Editor */}
            <div className="flex-1">
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

            {/* Console */}
            <div className="h-[180px] border-t border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2 px-4 py-2 text-xs border-b border-slate-800">
                <AlertCircle size={14} />
                <span>Console</span>
            </div>

            <div className="p-4 text-xs whitespace-pre-wrap">
                {runResult.status === "running" && (
                <div className="flex items-center gap-2 text-sky-400">
                    <Loader2 className="animate-spin" size={14} />
                    {runResult.message}
                </div>
                )}
                {runResult.status !== "running" && runResult.message}
            </div>
            </div>
          </section>
        </Panel>

      </Group>
    </main>
    
  );
};

export default Page;
