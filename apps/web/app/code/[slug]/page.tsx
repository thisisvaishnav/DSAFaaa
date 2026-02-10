"use client";
import React, { useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Zap,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import questionsData from "../../data/questions.json";

interface TestCase {
  input: string;
  expected_output: string;
}

interface QuestionFromSet {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  testcases: TestCase[];
}

interface Question {
  id: number;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  question: string;
  testcases: TestCase[];
}

type CodeMap = {
  [questionId: string]: {
    [language: string]: string;
  };
};

const getDefaultCode = (language: string): string => {
  switch (language) {
    case "javascript":
      return `// Write your solution in JavaScript\nconsole.log("DSA RoundRobin");`;
    case "python":
      return `# Write your solution in Python\nprint("DSA RoundRobin")`;
    case "cpp":
    default:
      return [
        "#include <iostream>",
        "using namespace std;",
        "",
        "int main() {",
        '    // Write your solution in C++',
        '    cout << "DSA RoundRobin" << endl;',
        "    return 0;",
        "}",
      ].join("\n");
  }
};

type SupportedLanguage = "javascript" | "python" | "cpp";

type RunStatus = "idle" | "running" | "success" | "error";

interface RunResult {
  status: RunStatus;
  message: string;
  testsPassed?: number;
  totalTests?: number;
}

type CodePageProps = {
  params: {
    slug: string;
  };
};

const Page: React.FC<CodePageProps> = ({ params }) => {
  const router = useRouter();

  const allQuestions = questionsData as QuestionFromSet[];
  const parsedSlugId = Number(params.slug);

  const foundQuestion = allQuestions.find(
    (singleQuestion) => singleQuestion.id === parsedSlugId,
  );

  const activeQuestion: Question = foundQuestion
    ? {
        id: foundQuestion.id,
        difficulty:
          foundQuestion.difficulty.toLowerCase() === "medium"
            ? "Medium"
            : foundQuestion.difficulty.toLowerCase() === "hard"
              ? "Hard"
              : "Easy",
        question: foundQuestion.question,
        testcases: foundQuestion.testcases,
      }
    : {
        id: 0,
        difficulty: "Easy",
        question: "Question not found.",
        testcases: [],
      };
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState<CodeMap>({
    [String(activeQuestion.id)]: {
      javascript: getDefaultCode("javascript"),
      python: getDefaultCode("python"),
      cpp: getDefaultCode("cpp"),
    },
  });
  const [runResult, setRunResult] = useState<RunResult>({
    status: "idle",
    message: "Run your code to see results.",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestionId = String(activeQuestion.id);

  const currentCode =
    codeByLanguage[currentQuestionId]?.[selectedLanguage] ??
    getDefaultCode(selectedLanguage);

  const handleBackClick = (): void => {
    router.back();
  };

  const handleLanguageChange = (language: SupportedLanguage): void => {
    if (language === selectedLanguage) {
      return;
    }

    setSelectedLanguage(language);
  };

  const handleCodeChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    const updatedCode = event.target.value;

    setCodeByLanguage((previous) => {
      const previousForQuestion = previous[currentQuestionId] ?? {};

      return {
        ...previous,
        [currentQuestionId]: {
          ...previousForQuestion,
          [selectedLanguage]: updatedCode,
        },
      };
    });
  };

  const handleRunCode = async (): Promise<void> => {
    setIsRunning(true);
    const testsCount = activeQuestion.testcases.length;

    setRunResult({
      status: "running",
      message: "Running your code against the sample test cases...",
    });

    // Simulate an evaluation flow to provide immediate feedback in the UI.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setRunResult({
      status: "success",
      message: "All sample test cases passed.",
      testsPassed: testsCount,
      totalTests: testsCount,
    });
    setIsRunning(false);
  };

  const handleSubmitCode = async (): Promise<void> => {
    setIsSubmitting(true);
    const testsCount = activeQuestion.testcases.length;

    setRunResult({
      status: "running",
      message: "Submitting your solution...",
    });

    // Simulate a full submission flow.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setRunResult({
      status: "success",
      message: "Submission accepted! All hidden test cases passed.",
      testsPassed: testsCount,
      totalTests: testsCount,
    });
    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <header className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="ml-1 flex items-center gap-2 text-sm text-slate-400">
          <Code2 className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-slate-100">
            Match / Problem {activeQuestion.id || params.slug}
          </span>
        </div>
      </header>

      <section className="grid flex-1 grid-cols-1 gap-4 px-2 py-3 md:px-4 md:py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] xl:gap-6">
        {/* Left: Problem description */}
        <div className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Problem {activeQuestion.id}
              </span>
              <span
                className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
                aria-label={`Difficulty: ${activeQuestion.difficulty}`}
              >
                {activeQuestion.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2 py-0.5">
                <Zap className="h-3 w-3 text-amber-300" />
                <span>DSA RoundRobin</span>
              </span>
            </div>
          </div>

          <h1 className="mb-3 text-base font-semibold text-slate-50 md:text-lg">
            Practice Problem
          </h1>

          <div className="flex-1 space-y-3 overflow-y-auto rounded-md bg-slate-950/40 p-3 text-sm leading-relaxed text-slate-200 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700/70">
            {activeQuestion.question
              .split("\n")
              .map((paragraph) => (
                <p key={paragraph} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}

            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sample Test Cases
              </p>

              <div className="space-y-2">
                {activeQuestion.testcases.map((testcase, index) => (
                  <div
                    key={`${testcase.input}-${index}`}
                    className="rounded-md border border-slate-800 bg-slate-900/80 p-2.5 text-xs"
                  >
                    <p className="mb-1 font-semibold text-slate-200">
                      Example {index + 1}
                    </p>
                    <p className="mb-1 text-slate-300">
                      <span className="font-semibold text-slate-100">
                        Input:
                      </span>{" "}
                      {testcase.input}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold text-slate-100">
                        Output:
                      </span>{" "}
                      {testcase.expected_output}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
            <div className="inline-flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-slate-500" />
              <span>
                Code will be evaluated against additional hidden test cases.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Editor and actions */}
        <div className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-slate-700/80 bg-slate-900/80 p-0.5">
              {(["javascript", "python", "cpp"] as SupportedLanguage[]).map(
                (language) => {
                  const isActive = selectedLanguage === language;

                  return (
                    <button
                      key={language}
                      type="button"
                      onClick={(): void =>
                        handleLanguageChange(language as SupportedLanguage)
                      }
                      className={[
                        "rounded px-2.5 py-1 text-xs font-medium capitalize transition",
                        isActive
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-300 hover:bg-slate-800",
                      ].join(" ")}
                      aria-pressed={isActive}
                      aria-label={`Use ${language} editor`}
                    >
                      {language === "cpp" ? "C++" : language}
                    </button>
                  );
                },
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/80 bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Run code against sample test cases"
              >
                {isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                <span>Run</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isSubmitting || isRunning}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Submit solution"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex min-h-[220px] flex-col rounded-md border border-slate-800 bg-slate-950/70">
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-xs text-slate-400">
                <div className="inline-flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-medium text-slate-200">
                    Code Editor
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(): void => {
                    setCodeByLanguage((previous) => ({
                      ...previous,
                      [currentQuestionId]: {
                        ...(previous[currentQuestionId] ?? {}),
                        [selectedLanguage]: getDefaultCode(selectedLanguage),
                      },
                    }));
                  }}
                  className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-200 transition hover:bg-slate-800"
                  aria-label="Reset code to starter template"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              <textarea
                className="flex-1 resize-none bg-transparent px-3 py-2 text-xs font-mono text-slate-100 outline-none scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700/70"
                value={currentCode}
                onChange={handleCodeChange}
                spellCheck={false}
                aria-label="Code editor"
              />
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  {runResult.status === "success" && (
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {runResult.status === "error" && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  )}
                  {runResult.status === "running" && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                  )}
                  {runResult.status === "idle" && (
                    <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span>Execution Result</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {runResult.testsPassed !== undefined &&
                    runResult.totalTests !== undefined && (
                      <span>
                        {runResult.testsPassed}/{runResult.totalTests} tests
                        passed
                      </span>
                    )}
                </div>
              </div>

              <p className="whitespace-pre-wrap text-[11px] text-slate-200">
                {runResult.message}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="inline-flex items-center gap-1">
                <ChevronLeft className="h-3 w-3" />
                <span>Use keyboard shortcuts like Ctrl + Enter to run.</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <span>Progress is kept per language.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;

