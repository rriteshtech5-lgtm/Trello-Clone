"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Bolt,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Copy,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Inbox as InboxIcon,
  LayoutTemplate,
  MessageSquare,
  Mail,
  MailOpen,
  Menu,
  Plug,
  Puzzle,
  Sparkles,
  Trello,
  Twitter,
  Youtube,
  Hexagon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const openFeaturesMenu = () => setIsFeaturesOpen(true);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#172b4d]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Trello className="h-7 w-7 text-[#0c66e4]" />
              <span className="text-[34px] leading-none font-semibold tracking-tight text-[#0052cc]">
                Trello
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-[17px] text-[#172b4d] md:flex">
              <button
                type="button"
                className={`inline-flex items-center gap-1 border-b-2 pb-1 transition-colors ${
                  isFeaturesOpen
                    ? "border-[#0c66e4] text-[#0c66e4]"
                    : "border-transparent hover:text-[#0c66e4]"
                }`}
                onMouseEnter={openFeaturesMenu}
                onFocus={openFeaturesMenu}
                onClick={() => setIsFeaturesOpen((prev) => !prev)}
              >
                Features
                <ChevronDown className="h-4 w-4" />
              </button>
              <a href="#" className="hover:text-[#0c66e4]">Solutions</a>
              <a href="#" className="hover:text-[#0c66e4]">Plans</a>
              <a href="#" className="hover:text-[#0c66e4]">Pricing</a>
              <a href="#" className="hover:text-[#0c66e4]">Resources</a>
            </nav>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-[21px] text-[#172b4d] hover:text-[#0c66e4]">
                  Dashboard
                </Link>
                <Link href="/dashboard">
                  <Button className="h-16 rounded-none bg-[#0c66e4] px-8 text-[33px] font-semibold text-white hover:bg-[#0055cc]">
                    Get Trello for free
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-[21px] text-[#172b4d] hover:text-[#0c66e4]">
                    Log in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="h-16 rounded-none bg-[#0c66e4] px-8 text-[33px] font-semibold text-white hover:bg-[#0055cc]">
                    Get Trello for free
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {isFeaturesOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/25"
              onClick={() => setIsFeaturesOpen(false)}
            />

            <div
              className="absolute left-0 top-full z-50 hidden w-full border-t border-black/5 bg-white shadow-xl md:block"
              onMouseEnter={openFeaturesMenu}
            >
              <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[2fr_1fr]">
                <div className="p-8">
                  <p className="text-[40px] font-semibold text-[#091e42]">
                    Explore the features that help your team succeed
                  </p>
                  <div className="mt-4 h-px bg-[#dfe1e6]" />

                  <div className="mt-8 grid grid-cols-3 gap-x-8 gap-y-10">
                    <div>
                      <p className="inline-flex items-center gap-2 text-[32px] font-semibold text-[#091e42]">
                        <InboxIcon className="h-5 w-5 text-[#7a869a]" />
                        Inbox
                      </p>
                      <p className="mt-3 text-[24px] leading-relaxed text-[#5e6c84]">
                        Capture every vital detail from emails, Slack, and
                        more directly in your Trello Inbox.
                      </p>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-2 text-[32px] font-semibold text-[#091e42]">
                        <Calendar className="h-5 w-5 text-[#7a869a]" />
                        Planner
                      </p>
                      <p className="mt-3 text-[24px] leading-relaxed text-[#5e6c84]">
                        Sync your calendar and allocate focused time slots to
                        boost productivity.
                      </p>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-2 text-[32px] font-semibold text-[#091e42]">
                        <Bolt className="h-5 w-5 text-[#7a869a]" />
                        Automation
                      </p>
                      <p className="mt-3 text-[24px] leading-relaxed text-[#5e6c84]">
                        Automate tasks and workflows with Trello&apos;s built-in
                        rules.
                      </p>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-2 text-[32px] font-semibold text-[#091e42]">
                        <Plug className="h-5 w-5 text-[#7a869a]" />
                        Power-Ups
                      </p>
                      <p className="mt-3 text-[24px] leading-relaxed text-[#5e6c84]">
                        Power up your teams by linking favorite tools with
                        Trello plugins.
                      </p>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-2 text-[32px] font-semibold text-[#091e42]">
                        <LayoutTemplate className="h-5 w-5 text-[#7a869a]" />
                        Templates
                      </p>
                      <p className="mt-3 text-[24px] leading-relaxed text-[#5e6c84]">
                        Give your team a blueprint for success with templates
                        from industry leaders and the Trello community.
                      </p>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-2 text-[32px] font-semibold text-[#091e42]">
                        <Hexagon className="h-5 w-5 text-[#7a869a]" />
                        Integrations
                      </p>
                      <p className="mt-3 text-[24px] leading-relaxed text-[#5e6c84]">
                        Find apps your team already uses or discover new ways
                        to get work done in Trello.
                      </p>
                    </div>
                  </div>
                </div>

                <aside className="bg-[#f3f1fa] p-8">
                  <p className="text-[42px] font-semibold text-[#091e42]">Meet Trello</p>
                  <div className="mt-4 h-px bg-[#998dd9]/40" />
                  <p className="mt-5 text-[24px] leading-relaxed text-[#44546f]">
                    Trello makes it easy for your team to get work done. Create
                    a board, keep projects organized, and move from sign-up to
                    productivity in minutes.
                  </p>
                  <button className="mt-8 rounded-md border border-[#7a62d3] px-5 py-3 text-[28px] font-medium text-[#253858] hover:bg-white">
                    Check out Trello
                  </button>
                </aside>
              </div>
            </div>
          </>
        )}
      </header>

      <div className="border-b border-black/5 bg-[#cdd9ea] px-4 py-3 text-center text-[18px] text-[#253858]">
        Accelerate your team&apos;s work with AI features now available for all plans.
      </div>

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 px-4 py-16 md:grid-cols-2 md:py-20">
        <section className="max-w-xl self-center">
          <h1 className="text-[52px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#091e42] md:text-[66px]">
            Capture, organize, and tackle your to-dos from anywhere.
          </h1>

          <p className="mt-6 text-[31px] leading-[1.45] text-[#253858]">
            Escape clutter and chaos to keep projects moving with clear boards,
            focused lists, and frictionless collaboration.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b778c]" />
              <Input
                placeholder="Email"
                className="h-12 rounded-md border-[#c1c7d0] bg-white pl-10 text-[16px]"
              />
            </div>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button className="h-12 bg-[#0c66e4] px-6 text-[16px] font-semibold hover:bg-[#0055cc]">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button className="h-12 bg-[#0c66e4] px-6 text-[16px] font-semibold hover:bg-[#0055cc]">
                  Sign up - it&apos;s free!
                </Button>
              </SignUpButton>
            )}
          </div>

          <p className="mt-5 text-[16px] text-[#5e6c84]">
            By entering your email, you acknowledge our privacy policy.
          </p>

          <button className="mt-8 inline-flex items-center gap-2 text-[16px] font-medium text-[#0c66e4] hover:text-[#0055cc]">
            Watch video
            <CirclePlay className="h-5 w-5" />
          </button>
        </section>

        <section className="relative flex min-h-[560px] items-center justify-center">
          <div className="absolute -left-6 bottom-8 h-28 w-40 rotate-[-36deg] rounded-md bg-[#ffab00]" />
          <div className="absolute left-14 bottom-[-16px] h-36 w-56 rotate-[38deg] rounded-md bg-[#a35bdb]" />

          <div className="relative z-10 w-[300px] rounded-[36px] border border-black/20 bg-[#101418] p-2 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
            <div className="rounded-[30px] bg-[#f7f8f9] p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#172b4d]">Inbox</span>
                <Sparkles className="h-4 w-4 text-[#0c66e4]" />
              </div>

              <div className="space-y-2">
                {[
                  "Plan sprint goals",
                  "Finalize deck",
                  "Launch campaign assets",
                  "Review PR and QA notes",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-[#dfe1e6] bg-white px-3 py-2 text-xs text-[#172b4d]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-dashed border-[#c1c7d0] bg-white px-3 py-2 text-xs text-[#5e6c84]">
                Add card
              </div>
            </div>
          </div>

          <div className="absolute right-3 top-20 grid gap-3">
            {[
              ["#4f46e5", "T"],
              ["#ef4444", "M"],
              ["#16a34a", "S"],
              ["#0284c7", "G"],
            ].map(([bg, label]) => (
              <div
                key={label}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: bg }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-16 md:py-20">
          <p className="text-sm font-semibold tracking-[0.08em] text-[#42526e]">
            TRELLO 101
          </p>

          <div className="mt-4 grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
            <div>
              <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.02em] text-[#091e42] md:text-[56px]">
                Your productivity powerhouse
              </h2>

              <p className="mt-6 text-[24px] leading-[1.4] text-[#172b4d]">
                Stay organized and efficient with Inbox, Boards, and Planner.
                Every to-do, idea, or responsibility finds its place.
              </p>

              <div className="mt-12 space-y-8">
                <div>
                  <h3 className="text-[36px] font-semibold leading-none text-[#091e42]">Inbox</h3>
                  <p className="mt-3 text-[30px] leading-[1.3] text-[#172b4d]">
                    When it&apos;s on your mind, it goes in your Inbox. Capture
                    your to-dos from anywhere, anytime.
                  </p>
                </div>

                <div>
                  <h3 className="text-[36px] font-semibold leading-none text-[#091e42]">Boards</h3>
                  <p className="mt-3 text-[30px] leading-[1.3] text-[#172b4d]">
                    Keep tabs on every task from quick notes to mission-critical
                    goals with a clean visual workflow.
                  </p>
                </div>

                <div className="rounded-xl border-l-4 border-[#00c2e0] bg-[#f7f8f9] p-5">
                  <h3 className="text-[36px] font-semibold leading-none text-[#091e42]">Planner</h3>
                  <p className="mt-3 text-[30px] leading-[1.3] text-[#172b4d]">
                    Drag, drop, get it done. Snap your top tasks into your
                    calendar and make time for what truly matters.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-5 flex items-center justify-end gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#172b4d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#172b4d]/40" />
                <span className="h-2.5 w-16 rounded-full bg-[#42526e]/60" />
              </div>

              <div className="rounded-2xl border border-[#dfe1e6] bg-[#f7f8f9] p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3">
                  <div className="inline-flex items-center gap-2 rounded-md border border-[#dfe1e6] px-3 py-1.5 text-[15px] font-medium text-[#172b4d]">
                    <Calendar className="h-4 w-4" />
                    Apr 2026
                  </div>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#dfe1e6] text-[#172b4d]">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#dfe1e6] px-4 text-[15px] font-medium text-[#172b4d]">
                    Today
                  </button>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#dfe1e6] text-[#172b4d]">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-[#ffffff] p-3">
                    <p className="text-sm font-semibold text-[#42526e]">Wed 23</p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="rounded-md bg-[#d9f8eb] px-2 py-2 text-[#164b35]">XF stand up</div>
                      <div className="rounded-md bg-[#d9f8eb] px-2 py-2 text-[#164b35]">Marketing assets</div>
                      <div className="rounded-md border border-[#f18f01] bg-[#fff4e5] px-2 py-2 text-[#7a4100]">Townhall prep</div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#ffffff] p-3">
                    <p className="text-sm font-semibold text-[#42526e]">Thu 24</p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="rounded-md bg-[#d9f8eb] px-2 py-2 text-[#164b35]">Stand up</div>
                      <div className="rounded-md border border-[#8f7ee7] bg-[#ede9ff] px-2 py-2 text-[#403294]">Focus time</div>
                      <div className="rounded-md bg-[#deebff] px-2 py-2 text-[#0747a6]">Roadmap shareout</div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#ffffff] p-3">
                    <p className="text-sm font-semibold text-[#42526e]">Fri 25</p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="rounded-md bg-[#deebff] px-2 py-2 text-[#0747a6]">Visual design workshop</div>
                      <div className="rounded-md bg-[#deebff] px-2 py-2 text-[#0747a6]">User research session</div>
                      <div className="rounded-md bg-[#deebff] px-2 py-2 text-[#0747a6]">Team hangout</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1264e3] py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              From message to action
            </h2>
            <p className="mt-5 text-xl leading-relaxed text-white/95 md:text-2xl">
              Quickly turn communication from your favorite apps into to-dos,
              keeping all your discussions and tasks organized in one place.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            <article className="grid gap-8 rounded-xl bg-[#f4f5f7] p-6 md:grid-cols-2 md:items-center md:p-8">
              <div className="rounded-lg bg-[#dfe1e6] p-6">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-[#44546f]">To</p>
                    <p className="mt-1 inline-flex rounded-md bg-[#5f8f23] px-3 py-1 text-sm font-semibold text-white">
                      INBOX@TRELLO.COM
                    </p>
                    <div className="mt-4 space-y-1 text-sm text-[#44546f]">
                      <p>From: bookings@acmehotel.com</p>
                      <p>Subject: Hotel - BOOKED</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dfe1e6] bg-white p-3 shadow-sm">
                    <Mail className="h-8 w-8 text-[#ea4335]" />
                  </div>

                  <div className="rounded-lg bg-[#5f8f23] p-4 text-white shadow-sm">
                    <p className="inline-flex items-center gap-2 text-2xl font-semibold">
                      <MailOpen className="h-6 w-6" />
                      Inbox
                    </p>
                    <div className="mt-3 rounded-md bg-white p-3 text-[#172b4d]">
                      Your stay in Austin
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.06em] text-[#091e42] uppercase">
                  <Sparkles className="h-4 w-4 text-[#7a62d3]" />
                  Email magic
                </p>
                <p className="mt-4 text-2xl leading-relaxed text-[#091e42] md:text-[34px]">
                  Easily turn your emails into to-dos. Forward them to your
                  Trello Inbox and they&apos;ll be transformed into organized tasks
                  with all the links you need.
                </p>
              </div>
            </article>

            <article className="grid gap-8 rounded-xl bg-[#f4f5f7] p-6 md:grid-cols-2 md:items-center md:p-8">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.06em] text-[#091e42] uppercase">
                  <Calendar className="h-4 w-4 text-[#00b8d9]" />
                  Message app sorcery
                </p>
                <p className="mt-4 text-2xl leading-relaxed text-[#091e42] md:text-[34px]">
                  Need to follow up on a message from Slack or Microsoft Teams?
                  Send it directly to your Trello board with AI-generated
                  summaries and useful links.
                </p>
              </div>

              <div className="rounded-lg bg-[#dfe1e6] p-6">
                <div className="relative rounded-lg bg-[#cce0ff] p-5">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xl font-semibold text-[#172b4d]">
                      Gabrielle Bossio
                    </p>
                    <p className="mt-1 text-sm text-[#44546f]">
                      Send over your Banc.ly analysis draft when it&apos;s ready.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm">
                      <MessageSquare className="h-8 w-8 text-[#5b5fc7]" />
                    </div>
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm">
                      <Bot className="h-8 w-8 text-[#2eb67d]" />
                    </div>
                  </div>

                  <div className="absolute -bottom-8 right-4 w-[280px] rounded-lg bg-[#5f8f23] p-3 text-white shadow-md">
                    <p className="inline-flex items-center gap-2 text-2xl font-semibold">
                      <MailOpen className="h-5 w-5" />
                      Inbox
                    </p>
                    <div className="mt-2 rounded-md bg-white p-3 text-[#172b4d]">
                      Send Banc.ly Competitive Analysis Draft to Gabrielle
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f5f7] py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <p className="text-sm font-semibold tracking-[0.08em] text-[#091e42] uppercase">
            Work smarter
          </p>
          <h2 className="mt-3 text-5xl font-semibold tracking-[-0.02em] text-[#091e42] md:text-6xl">
            Do more with Trello
          </h2>
          <p className="mt-5 max-w-3xl text-2xl leading-relaxed text-[#172b4d] md:text-3xl">
            Customize the way you organize with easy integrations, automation,
            and mirroring of your to-dos across multiple locations.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-xl bg-[#f7f8f9] p-6">
              <Puzzle className="h-12 w-12 text-[#7a62d3]" />
              <h3 className="mt-6 text-[40px] font-semibold text-[#091e42]">
                Integrations
              </h3>
              <p className="mt-4 text-[30px] leading-[1.35] text-[#172b4d]">
                Connect the apps you already use and fine-tune your workflow for
                the way your team moves.
              </p>
              <button className="mt-6 rounded-md border border-[#0c66e4] px-5 py-2 text-lg font-medium text-[#0c66e4] hover:bg-[#deebff]">
                Browse Integrations
              </button>
            </article>

            <article className="rounded-xl bg-[#f7f8f9] p-6">
              <Bot className="h-12 w-12 text-[#0c66e4]" />
              <h3 className="mt-6 text-[40px] font-semibold text-[#091e42]">
                Automation
              </h3>
              <p className="mt-4 text-[30px] leading-[1.35] text-[#172b4d]">
                No-code automation is built into every board so your team can
                focus on what matters while the repetitive work runs itself.
              </p>
              <button className="mt-6 rounded-md border border-[#0c66e4] px-5 py-2 text-lg font-medium text-[#0c66e4] hover:bg-[#deebff]">
                Get to know Automation
              </button>
            </article>

            <article className="rounded-xl bg-[#f7f8f9] p-6">
              <Copy className="h-12 w-12 text-[#f18f01]" />
              <h3 className="mt-6 text-[40px] font-semibold text-[#091e42]">
                Card mirroring
              </h3>
              <p className="mt-4 text-[30px] leading-[1.35] text-[#172b4d]">
                View your to-dos from multiple boards in one place. Mirror a
                card to keep track of work wherever you need it.
              </p>
              <button className="mt-6 rounded-md border border-[#0c66e4] px-5 py-2 text-lg font-medium text-[#0c66e4] hover:bg-[#deebff]">
                Compare plans
              </button>
            </article>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <span className="h-3 w-16 rounded-full bg-[#5e6c84]" />
            <span className="h-3 w-3 rounded-full bg-[#091e42]" />
            <span className="h-3 w-3 rounded-full bg-[#091e42]/40" />
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe1e6] text-[#44546f]">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe1e6] text-[#44546f]">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 grid overflow-hidden rounded-xl border border-[#dfe1e6] bg-white md:grid-cols-[2fr_1fr]">
            <div className="p-8 md:p-10">
              <p className="text-[36px] leading-[1.35] text-[#091e42] md:text-[46px]">
                [Trello is] great for simplifying complex processes. As a
                manager, I can chunk work into bite-sized pieces for my team and
                still keep a bird&apos;s-eye view.
              </p>
            </div>
            <div className="bg-[#0c53b7] p-8 text-white md:p-10">
              <p className="text-6xl font-semibold leading-tight md:text-7xl">
                75% of organizations report that Trello improves team
                communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-[1200px] px-4 text-center">
          <p className="text-[22px] text-[#091e42] md:text-[36px]">
            Join a community of millions of users globally who are using Trello
            to get more done.
          </p>

          <div className="mt-8 grid grid-cols-2 items-center justify-items-center gap-5 text-[#253858] md:grid-cols-6 md:gap-8">
            <span className="text-[42px] font-bold tracking-tight md:text-[56px]">VISA</span>
            <span className="text-[34px] font-semibold lowercase md:text-[50px]">coinbase</span>
            <span className="text-[24px] font-semibold md:text-[34px]">JOHN DEERE</span>
            <span className="text-[42px] font-semibold lowercase md:text-[56px]">zoom</span>
            <span className="text-[20px] tracking-[0.18em] md:text-[28px]">GRAND HYATT</span>
            <span className="text-[34px] italic md:text-[48px]">Fender</span>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f5f7] py-20 md:py-24">
        <div className="mx-auto w-full max-w-[1200px] px-4 text-center">
          <h2 className="text-5xl font-semibold tracking-[-0.02em] text-[#091e42] md:text-6xl">
            Get started with Trello today
          </h2>

          <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Email"
              className="h-14 border-[#c1c7d0] bg-white text-[22px]"
            />
            {isSignedIn ? (
              <Link href="/dashboard" className="sm:w-auto">
                <Button className="h-14 w-full bg-[#0c66e4] px-7 text-[26px] font-semibold hover:bg-[#0055cc]">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button className="h-14 w-full bg-[#0c66e4] px-7 text-[26px] font-semibold hover:bg-[#0055cc]">
                  Sign up - it&apos;s free!
                </Button>
              </SignUpButton>
            )}
          </div>

          <p className="mt-6 text-[20px] text-[#091e42] md:text-[28px]">
            By entering your email, you acknowledge the Atlassian Privacy
            Policy.
          </p>
        </div>
      </section>

      <footer className="bg-[#172b4d] text-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
          <div className="grid gap-10 border-b border-white/20 pb-10 md:grid-cols-5">
            <div>
              <div className="inline-flex items-center gap-2">
                <Trello className="h-10 w-10 text-white" />
                <span className="text-5xl font-semibold tracking-tight">Trello</span>
              </div>
              <a
                href="#"
                className="mt-6 inline-block text-[30px] text-white/95 hover:text-white"
              >
                Log In
              </a>
            </div>

            <div>
              <h4 className="text-[34px] font-semibold">About Trello</h4>
              <p className="mt-3 text-[24px] leading-relaxed text-white/80">
                What&apos;s behind the boards.
              </p>
            </div>

            <div>
              <h4 className="text-[34px] font-semibold">Jobs</h4>
              <p className="mt-3 text-[24px] leading-relaxed text-white/80">
                Learn about open roles on the Trello team.
              </p>
            </div>

            <div>
              <h4 className="text-[34px] font-semibold">Apps</h4>
              <p className="mt-3 text-[24px] leading-relaxed text-white/80">
                Download the Trello App for your Desktop or Mobile devices.
              </p>
            </div>

            <div>
              <h4 className="text-[34px] font-semibold">Contact us</h4>
              <p className="mt-3 text-[24px] leading-relaxed text-white/80">
                Need anything? Get in touch and we can help.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button className="inline-flex items-center gap-2 text-[28px] text-white/90 hover:text-white">
              <Globe className="h-6 w-6" />
              English
              <ChevronDown className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap items-center gap-6 text-[20px] text-white/85">
              <a href="#" className="hover:text-white">Notice at Collection</a>
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <span>Copyright © 2024 Atlassian</span>
            </div>

            <div className="flex items-center gap-4">
              {[Instagram, Facebook, Linkedin, Twitter, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
