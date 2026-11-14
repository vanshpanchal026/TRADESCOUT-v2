"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, ArrowLeft, Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSent(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Terminal</span>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Mail className="h-3.5 w-3.5" />
          <span>Direct Trader Support</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Contact Support &amp; Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect directly with the platform engineering team in Punjab, India
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-foreground">Email Support Desk</h2>
            <a
              href="mailto:support@scanthecharts.com"
              className="text-xs font-mono font-semibold text-primary hover:underline block"
            >
              support@scanthecharts.com
            </a>
            <p className="text-[11px] text-muted-foreground">Average response time: &lt; 4 hours during market sessions.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-bull/10 text-bull flex items-center justify-center font-bold">
              <MapPin className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-foreground">Operating Entity Location</h2>
            <p className="text-xs font-semibold text-foreground">
              Hoshiarpur, Punjab, India
            </p>
            <p className="text-[11px] text-muted-foreground">Engineering &amp; Indian equity research operations.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-foreground">Market Hours Support</h2>
            <p className="text-xs font-mono text-foreground">
              Monday – Friday: 08:30 – 18:30 IST
            </p>
            <p className="text-[11px] text-muted-foreground">Live desk active throughout market hours.</p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Send a Direct Message</span>
          </h2>

          {sent ? (
            <div className="p-8 rounded-xl bg-bull/10 border border-bull/20 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-bull mx-auto" />
              <h4 className="text-sm font-bold text-foreground">Message Dispatched Successfully</h4>
              <p className="text-xs text-muted-foreground">
                Thank you for contacting us. A member of our support team will reply to your registered email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Trader Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Question on 4% Breakout Scanner or RRG Quadrant"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="How can we help you improve your swing trading workflow?"
                  className="w-full p-3 text-xs rounded-xl border border-border bg-background text-foreground resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Message to Support</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
