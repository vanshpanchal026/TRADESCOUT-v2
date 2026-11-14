"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, AlertCircle, Bug, Database, Lightbulb, MessageSquare } from "lucide-react";

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDrawer({ isOpen, onClose }: FeedbackDrawerProps) {
  const [category, setCategory] = useState<"bug" | "data" | "feature" | "general">("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft and reset submission view when drawer opens
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isOpen) {
      setSubmitted(false);
      try {
        const savedDraft = localStorage.getItem("ts-feedback-draft");
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed && typeof parsed === "object") {
              if (parsed.category) setCategory(parsed.category);
              if (parsed.feedbackText) setFeedbackText(parsed.feedbackText);
            } else if (typeof parsed === "string") {
              setFeedbackText(parsed);
            }
          } catch {
            setFeedbackText(savedDraft);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  // Persist draft in client-side storage as user edits while drawer is open
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;
    try {
      if (feedbackText.trim()) {
        localStorage.setItem(
          "ts-feedback-draft",
          JSON.stringify({ category, feedbackText })
        );
      }
    } catch {}
  }, [isOpen, category, feedbackText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);

    const newSubmission = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      category,
      text: feedbackText.trim(),
      fileName: fileName || null,
      submittedAt: new Date().toISOString(),
    };

    try {
      const existingRaw = localStorage.getItem("ts-feedback-submissions");
      const submissions = existingRaw ? JSON.parse(existingRaw) : [];
      submissions.push(newSubmission);
      localStorage.setItem("ts-feedback-submissions", JSON.stringify(submissions));
      localStorage.setItem("ts-feedback-history", JSON.stringify(submissions));
      localStorage.removeItem("ts-feedback-draft");
    } catch (err) {
      console.error("Failed to persist feedback submission:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFeedbackText("");
        setFileName(null);
        onClose();
      }, 2000);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const categories = [
    {
      id: "bug",
      title: "Bug Report",
      desc: "Something isn't working as expected.",
      icon: Bug,
    },
    {
      id: "data",
      title: "Wrong Data",
      desc: "A stock price, metric, or chart looks incorrect.",
      icon: Database,
    },
    {
      id: "feature",
      title: "Feature Idea",
      desc: "I'd love to see a new tool, indicator, or filter.",
      icon: Lightbulb,
    },
    {
      id: "general",
      title: "General Feedback",
      desc: "General comment or suggestion.",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Give Feedback</h2>
                <p className="text-xs text-muted-foreground">Help us build the best NSE trading terminal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-bull/10 text-bull flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Thank you for your feedback!</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your feedback has been logged. Our product engineering team in Punjab reviews every submission.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Select Feedback Type
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const selected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id as any)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border cursor-pointer text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 font-bold"
                              : "border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <input
                            type="radio"
                            name="feedback-category"
                            checked={selected}
                            onChange={() => setCategory(cat.id as any)}
                            className="mt-1 text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                              <span>{cat.title}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{cat.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Details</label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {1000 - feedbackText.length} left
                    </span>
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 1000);
                      setFeedbackText(val);
                      if (!val.trim()) {
                        try {
                          localStorage.removeItem("ts-feedback-draft");
                        } catch {}
                      }
                    }}
                    rows={5}
                    placeholder="Tell us what happened, what you expected, or your idea for TRADESCOUT..."
                    required
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Screenshot Upload Drop Zone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Attach Screenshot (Optional)</label>
                  <label className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
                    <span className="text-xs text-muted-foreground">
                      {fileName ? (
                        <span className="font-semibold text-primary">{fileName}</span>
                      ) : (
                        "Click to browse or drop screenshot here"
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-border bg-muted/30 text-center">
            <p className="text-[11px] text-muted-foreground">
              Direct support: <span className="text-foreground font-medium">support@scanthecharts.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDrawer;
