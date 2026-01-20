import { useState, useEffect } from "react";
import { useWindowWidth } from "../../breakpoints";
import { supabase } from "../../../lib/supabase";
import {
  initTrackingContext,
  trackCtaClick,
  trackModalOpen,
  trackEmailTyped,
  trackSubmit,
  markSignupCompleted,
  getTrackingContext,
} from "../../../lib/tracking";
import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { Chat } from "../../components/Chat";
import { DotsThreeOutline } from "../../components/DotsThreeOutline";
import { Footer } from "../../components/Footer";
import { JiraCoreWrapper } from "../../components/JiraCoreWrapper";
import { Link } from "../../components/Link";
import { Logo } from "../../components/Logo";
import { Navbar } from "../../components/Navbar";
import { NotionWrapper } from "../../components/NotionWrapper";
import { Plus } from "../../components/Plus";
import { TestimonialCard } from "../../components/TestimonialCard";
import { TopBarLight } from "../../components/TopBarLight";
import { WhyChooseUsCard } from "../../components/WhyChooseUsCard";
import { CatppuccinFolderDocs2 } from "../../icons/CatppuccinFolderDocs2";
import { Chartbar } from "../../icons/Chartbar";
import { Checkcircle } from "../../icons/Checkcircle";
import { FluentPeopleTeam16Regular } from "../../icons/FluentPeopleTeam16Regular";
import { FormatOutlineWeightRegular7 } from "../../icons/FormatOutlineWeightRegular7";
import { JiraCore2 } from "../../icons/JiraCore2";
import { Notion1 } from "../../icons/Notion1";
import { Slack } from "../../icons/Slack";
import { SocialIcons1 } from "../../icons/SocialIcons1";
import "./style.css";

export const Design = () => {
  const screenWidth = useWindowWidth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTrackedEmailTyped, setHasTrackedEmailTyped] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  
  // Feature flag: Set to true to re-enable Pricing sections
  const SHOW_PRICING = false;

  // Initialize tracking on page load
  useEffect(() => {
    initTrackingContext();
  }, []);

  // Track modal open
  useEffect(() => {
    if (showModal) {
      trackModalOpen();
    }
  }, [showModal]);

  // Track email input (first non-empty)
  useEffect(() => {
    if (email.trim() && !hasTrackedEmailTyped) {
      trackEmailTyped();
      setHasTrackedEmailTyped(true);
    }
  }, [email, hasTrackedEmailTyped]);

  const faqData = [
    {
      question: "What is ScopeDocs and how does it work?",
      answer: "ScopeDocs turns your Slack, tickets, PRs, and specs into clean, structured docs, then keeps them updated as work changes.",
    },
    {
      question: "How is this different from a wiki or Notion?",
      answer: "Wikis are manual and go stale. ScopeDocs generates docs from real work and refreshes them when things change.",
    },
    {
      question: "How do you keep docs accurate and up to date?",
      answer: "We generate from source artifacts (threads, tickets, PRs) and include timestamps and citations, so every summary is traceable.",
    },
    {
      question: "How do permissions and privacy work?",
      answer: "ScopeDocs is permissions-aware, it only shows content a user is allowed to access in your connected tools.",
    },
    {
      question: "Do you train AI models on our company data?",
      answer: "No, your workspace data is used to generate outputs for your team, not to train a public model.",
    },
    {
      question: "How quickly can we get started?",
      answer: "Most teams connect Slack and generate their first docs in minutes, then expand to tickets and code when ready.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFaqKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFaq(index);
    }
  };

  const validateEmail = (email) => {
    return email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle CTA click
  const handleCtaClick = () => {
    trackCtaClick();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      return;
    }

    // Track submit
    trackSubmit();

    setIsSubmitting(true);

    try {
      // Save email to Supabase
      const emailToSave = email.trim();
      console.log('📧 Checking if email exists:', emailToSave);
      
      // First, check if email already exists (best effort - continue if check fails)
      let emailExists = false;
      try {
        const { data: existingData, error: checkError } = await supabase
          .from('email_signups')
          .select('emails')
          .eq('emails', emailToSave)
          .limit(1);

        if (checkError) {
          console.warn('⚠️ Error checking existing email (will proceed with insert):', checkError.message);
          // If check fails, assume email is new and proceed with insert
          emailExists = false;
        } else {
          emailExists = existingData !== null && existingData !== undefined && existingData.length > 0;
          console.log(emailExists ? '📧 Email already exists in database' : '📧 Email is new');
        }
      } catch (checkErr) {
        console.warn('⚠️ Exception during email check (will proceed with insert):', checkErr);
        emailExists = false;
      }

      setIsExistingUser(emailExists);

      if (emailExists) {
        console.log('📧 Email already exists, skipping insert to prevent duplicate');
        // Still mark signup as completed for tracking
        markSignupCompleted();
        
        // Store submitted email and show modal
        setSubmittedEmail(emailToSave);
        setShowModal(true);
        setEmail("");
        setIsSubmitting(false);
        return;
      }

      // Email doesn't exist, proceed with insert
      console.log('💾 Saving NEW email to Supabase:', emailToSave);
      
      // Create timestamp with local timezone
      const now = new Date();
      const timezoneOffset = -now.getTimezoneOffset(); // offset in minutes
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
      
      // Format as ISO string with timezone offset
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const localTimestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
      
      // Get tracking context for insert
      const trackingContext = getTrackingContext();
      
      // Build insert payload with all tracking data
      const insertPayload = {
        emails: emailToSave,
        created_at: localTimestamp,
        ...trackingContext,
        signup_completed: false, // Will be set to true on success
        signup_completed_at: null, // Will be set on success
      };
      
      console.log('📤 Inserting to Supabase with tracking data:', {
        totalFields: Object.keys(insertPayload).length,
        device: trackingContext.device_type,
        os: trackingContext.os,
        browser: trackingContext.browser,
        signupStep: trackingContext.signup_step,
        ctaClicks: trackingContext.cta_click_count,
        events: trackingContext.events_count,
      });
      
      console.log('📤 Attempting insert with payload:', {
        email: emailToSave,
        totalFields: Object.keys(insertPayload).length,
        hasTracking: Object.keys(trackingContext).length > 0,
      });
      
      let { data, error } = await supabase
        .from('email_signups')
        .insert([insertPayload])
        .select();

      // If insert fails with tracking data, try with just basic fields
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        console.warn('⚠️ Insert with tracking data failed, retrying with basic fields only...');
        console.warn('Original error:', error.message);
        
        const basicPayload = {
          emails: emailToSave,
          created_at: localTimestamp,
        };
        
        const retryResult = await supabase
          .from('email_signups')
          .insert([basicPayload])
          .select();
        
        data = retryResult.data;
        error = retryResult.error;
        
        if (!error) {
          console.log('✅ Insert successful with basic fields only');
        }
      }

      if (error) {
        console.error('❌ Error saving email to Supabase:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Check for specific error types
        if (error.code === '42501') {
          console.error('🔒 RLS Policy Error: Your Supabase table needs an INSERT policy for anonymous users');
          console.error('💡 Go to Supabase Dashboard → Authentication → Policies → Create policy for INSERT');
        } else if (error.code === 'PGRST204') {
          console.error('🔍 Column Error: One or more columns in the insert payload may not exist in the table');
          console.error('💡 Check that all columns exist in your email_signups table');
        } else if (error.code === '23505') {
          console.error('🔍 Unique Constraint: Email might already exist (unique constraint violation)');
          // Treat as existing user
          setIsExistingUser(true);
        }
      } else {
        // Mark signup as completed
        markSignupCompleted();
        
        console.log('✅✅✅ Email saved successfully to Supabase!');
        console.log('✅ Email address:', emailToSave);
        console.log('✅ Returned data:', data);
        if (data && data[0]) {
          console.log('✅ Record ID:', data[0].id);
          console.log('✅ Total columns saved:', Object.keys(data[0]).length);
          console.log('✅ All saved fields:', Object.keys(data[0]).join(', '));
        }
      }

      // Store submitted email before clearing
      setSubmittedEmail(emailToSave);
      // Show success modal
      setShowModal(true);
      setEmail("");
    } catch (err) {
      console.error('Unexpected error:', err);
      setShowModal(true);
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmittedEmail("");
    setIsExistingUser(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  return (
    <div
      className="design"
      style={{
        alignItems:
          (screenWidth >= 1024 && screenWidth < 1440) || screenWidth >= 1440
            ? "flex-start"
            : undefined,
        display:
          (screenWidth >= 1024 && screenWidth < 1440) || screenWidth >= 1440
            ? "flex"
            : undefined,
        flexDirection:
          (screenWidth >= 1024 && screenWidth < 1440) || screenWidth >= 1440
            ? "column"
            : undefined,
        gap:
          (screenWidth >= 1024 && screenWidth < 1440) || screenWidth >= 1440
            ? "140px"
            : undefined,
        height:
          screenWidth >= 1024 && screenWidth < 1440 ? "8369px" : undefined,
        minHeight: screenWidth < 1024 ? "9928px" : undefined,
        minWidth:
          screenWidth < 1024
            ? "440px"
            : screenWidth >= 1024 && screenWidth < 1440
              ? "1024px"
              : screenWidth >= 1440
                ? "1440px"
                : undefined,
        overflow:
          (screenWidth >= 1024 && screenWidth < 1440) || screenWidth < 1024
            ? "hidden"
            : undefined,
        width: screenWidth < 1024 ? "100%" : undefined,
      }}
    >
      {screenWidth < 1024 && (
        <>
          <Navbar
            className="navbar-mobile-instance"
            logoFill="/img/fill-3-1.svg"
            logoImg="/img/fill-2-3.svg"
            logoFill1="/img/fill-1-1.svg"
            hasMenu={false}
            buttonText="Book Demo"
          />
          <div className="container">
            <div className="hero">
              <img className="lights" alt="Lights" src="/img/lights-1.svg" />

              <div className="container-2">
                <div className="frame-wrapper">
                  <div className="frame">
                    <div className="content-7">
                      <button className="button-3">
                        <div className="group-3">
                          <div className="frame-2" />

                          <div className="frame-3" />

                          <div className="frame-4" />

                          <div className="frame-5" />
                        </div>

                        <div className="text-10">
                          Backed by Character Capital
                        </div>
                      </button>

                      <div className="text-11">
                        Know your code,
                        <br />
                        within minutes
                      </div>

                      <p className="text-12">
                        <span className="span">ScopeDocs </span>

                        <span className="text-wrapper-5">
                          turns your team’s daily work into always{" "}
                        </span>

                        <span className="span">current internal docs</span>

                        <span className="text-wrapper-5">, </span>

                        <span className="text-wrapper-6">no extra effort.</span>
                      </p>
                    </div>

                    <form className="input" onSubmit={handleSubmit}>
                      <input
                        type="email"
                        className="email-input"
                        placeholder="Email Address Here"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />

                      <button 
                        type="submit" 
                        className="button-4" 
                        disabled={isSubmitting}
                        onClick={handleCtaClick}
                      >
                        <div className="text-wrapper-7">
                          {isSubmitting ? 'Submitting...' : 'Get Started Now'}
                        </div>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="frame-6" id="smart-solutions">
            <div className="text-13">
              Smart Solutions for
              <br />
              Code Documentation
            </div>

            <p className="text-25">
              Stay organized, prioritize tasks, and achieve your goals
              effortlessly
            </p>

            <div className="why-choose-us">
              <div className="content-groups-2">
                <WhyChooseUsCard
                  className="why-choose-us-card-instance"
                  contentClassName="why-choose-us-card-3"
                  contentClassNameOverride="why-choose-us-card-4"
                  icon={
                    <CatppuccinFolderDocs2 className="catppuccin-folder-docs-2" />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text="Living Docs"
                  text1="Connect Slack, GitHub PRs, Jira/Linear tickets, and specs, and ScopeDocs keeps internal docs current as work changes."
                  version="one"
                />
                <WhyChooseUsCard
                  className="why-choose-us-card-5"
                  icon={
                    <FormatOutlineWeightRegular7
                      className="instance-node-5"
                      color="white"
                    />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text2="Your Team’s Way"
                  text3="Match your org’s structure, services, and processes, without forcing a new workflow or rigid templates."
                  version="two"
                />
                <WhyChooseUsCard
                  caretright4Color="#0A0A0A"
                  className="why-choose-us-card-5"
                  icon={
                    <FluentPeopleTeam16Regular
                      className="fluent-people-team"
                      color="white"
                    />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text4="Shareable Context"
                  text5="Create clean pages people can hand off, onboard with, and reference later, with links back to the original sources."
                  version="three"
                />
                <WhyChooseUsCard
                  caretright4Color="white"
                  className="why-choose-us-card-6"
                  icon={<Chartbar className="instance-node-5" color="white" />}
                  iconContainerClassName="why-choose-us-card-2"
                  text6="Change Intelligence"
                  text7="See what changed, why it changed, and what it might affect, all source-linked so it’s easy to track."
                  textClassName="instance-node-6"
                  version="four"
                />
              </div>
            </div>
          </div>

          <div className="frame-7">
            <div className="content-8">
              <div className="content-9">
                <p className="text-14">
                  Turn Work Into <br />
                  Living Docs
                </p>

                <p className="text-15">
                  <span className="text-wrapper-8">ScopeDocs </span>

                  <span className="text-wrapper-9">
                    automatically generates documentation
                  </span>

                  <span className="text-wrapper-8"> from your </span>

                  <span className="text-wrapper-9">
                    Slack threads, tickets, and code changes
                  </span>

                  <span className="text-wrapper-10">,</span>

                  <span className="text-wrapper-8">
                    {" "}
                    then keeps it continuously updated as work evolves. No{" "}
                  </span>

                  <span className="text-wrapper-9">manual writing</span>

                  <span className="text-wrapper-8">, no </span>

                  <span className="text-wrapper-11">outdated wikis</span>
                </p>
              </div>
            </div>

            <div className="image">
              <div className="image-2">
                <div className="container-3">
                  <TopBarLight
                    className="top-bar-light-instance"
                    iconClassName="top-bar-light-2"
                    style="dark"
                  />
                  <div className="task-dashboard">
                    <div className="button-5">
                      <div className="text-16">In Progress</div>

                      <div className="div-3">
                        <Plus format="outline" weight="bold" />
                        <DotsThreeOutline format="outline" weight="fill" />
                      </div>
                    </div>

                    <div className="button-6">
                      <div className="text-16">Done</div>

                      <div className="div-3">
                        <Plus format="outline" weight="bold" />
                        <DotsThreeOutline format="outline" weight="fill" />
                      </div>
                    </div>

                    <div className="card">
                      <div className="header">
                        <button className="button-7">
                          <div className="text-17">Medium</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Organize and Lead the Team Feedback Session for
                          Project
                        </p>

                        <p className="text-19">
                          Schedule a meeting to gather feedback on the latest
                          project designs.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-2" />

                          <div className="avatar-3" />

                          <div className="avatar-3" />

                          <div className="avatar-4">
                            <div className="text-20">+2</div>
                          </div>
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">2</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-2">
                      <div className="header">
                        <button className="button-7">
                          <div className="text-17">Medium</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Revise and Update Marketing Campaign Assets for the
                          Holiday
                        </p>

                        <p className="text-19">
                          Adjust ad visuals and copy to align with the holiday
                          campaign goals.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-2" />

                          <div className="avatar-5" />
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">5</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-3">
                      <div className="header">
                        <button className="button-8">
                          <div className="text-21">High</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Draft a Comprehensive Blog Post on Task Management
                          Strategies
                        </p>

                        <p className="text-19">
                          Write a 500-word blog post offering tips for better
                          task management.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-6" />
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">2</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-4">
                      <div className="header">
                        <button className="button-8">
                          <div className="text-21">High</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Prepare Scripts and Recruit Participants for Usability
                          Testing
                        </p>

                        <p className="text-19">
                          Set up user testing procedures to evaluate the
                          app&#39;s functionality.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-2" />

                          <div className="avatar-3" />

                          <div className="avatar-3" />

                          <div className="avatar-4">
                            <div className="text-20">+1</div>
                          </div>
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">6</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <img
                  className="software-developer"
                  alt="Software developer"
                  src="/img/software-developer-coding-on-laptop-2025-01-29-08-37-09-utc-2.png"
                />
              </div>
            </div>
          </div>

          <div className="frame-8">
            <div className="content-12">
              <div className="content-13">
                <p className="text-22">Find Answers in Seconds, With Sources</p>

                <p className="text-23">
                  Ask a question and get a decision-ready answer backed by
                  source links, owners, and timestamps. Every summary is
                  traceable to the exact conversation, PR, or ticket, so teams
                  can trust it, share it, and move faster.
                </p>
              </div>
            </div>

            <div className="image">
              <div className="container-4">
                <TopBarLight
                  className="top-bar-light-instance"
                  iconClassName="top-bar-light-2"
                  style="dark"
                />
                <div className="task-dashboard">
                  <div className="button-5">
                    <div className="text-16">In Progress</div>

                    <div className="div-3">
                      <Plus format="outline" weight="bold" />
                      <DotsThreeOutline format="outline" weight="fill" />
                    </div>
                  </div>

                  <div className="button-6">
                    <div className="text-16">Done</div>

                    <div className="div-3">
                      <Plus format="outline" weight="bold" />
                      <DotsThreeOutline format="outline" weight="fill" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="header">
                      <button className="button-7">
                        <div className="text-17">Medium</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Organize and Lead the Team Feedback Session for Project
                      </p>

                      <p className="text-19">
                        Schedule a meeting to gather feedback on the latest
                        project designs.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-2" />

                        <div className="avatar-3" />

                        <div className="avatar-3" />

                        <div className="avatar-4">
                          <div className="text-20">+2</div>
                        </div>
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">2</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-2">
                    <div className="header">
                      <button className="button-7">
                        <div className="text-17">Medium</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Revise and Update Marketing Campaign Assets for the
                        Holiday
                      </p>

                      <p className="text-19">
                        Adjust ad visuals and copy to align with the holiday
                        campaign goals.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-2" />

                        <div className="avatar-5" />
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">5</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-3">
                    <div className="header">
                      <button className="button-8">
                        <div className="text-21">High</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Draft a Comprehensive Blog Post on Task Management
                        Strategies
                      </p>

                      <p className="text-19">
                        Write a 500-word blog post offering tips for better task
                        management.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-6" />
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">2</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-4">
                    <div className="header">
                      <button className="button-8">
                        <div className="text-21">High</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Prepare Scripts and Recruit Participants for Usability
                        Testing
                      </p>

                      <p className="text-19">
                        Set up user testing procedures to evaluate the app&#39;s
                        functionality.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-2" />

                        <div className="avatar-3" />

                        <div className="avatar-3" />

                        <div className="avatar-4">
                          <div className="text-20">+1</div>
                        </div>
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">6</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <img
                    className="software-developer-2"
                    alt="Software developer"
                    src="/img/software-developer-coding-on-laptop-2025-01-29-08-37-09-utc-1-2.png"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="content-14">
            <div className="text-37">
              Works with the tools
              <br />
              you already use
            </div>
            <p className="text-25">
              Sync your stack in minutes, turn PRs, tickets, and threads into living docs
            </p>
          </div>

          <div className="v" />

          <div className="frame-9">
            <div className="frame-10">
              <div className="content-15">
                <p className="text-26">
                  What users <br />
                  Say about ScopeDocs
                </p>

                <p className="text-25">
                  Our users success stories highlight the real value
                </p>
              </div>

              <div className="row-wrapper">
                <div className="row-3">
                  <TestimonialCard
                    avatarClassName="testimonial-card-2"
                    className="testimonial-card-instance"
                    logo="/img/logo-6.svg"
                    text="&#34;I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what’s going to happen…because this has been really difficult for us to get LLMs to [document] this well.”"
                    version="one"
                  />
                  <TestimonialCard
                    avatarClassName="testimonial-card-5"
                    className="testimonial-card-4"
                    text="&#34;I&#39;ve paid for a lot of project management tools, but what caught my attention was that your product was generative documentation!&#34;"
                    text1="David K"
                    text2="Software Development Engineer"
                    vector="/img/vector-32.svg"
                    vectorClassName="testimonial-card-3"
                    version="eight"
                  />
                  <TestimonialCard
                    avatarClassName="testimonial-card-7"
                    className="testimonial-card-6"
                    img="/img/logo-7.png"
                    text="We finally have documentation that stays current. When tickets and PRs change, ScopeDocs keeps the docs aligned with reality."
                    text1="Alexa R."
                    text2="VP of Engineering"
                    version="three"
                  />
                </div>
              </div>

              <div className="text-27">
                Frequently
                <br />
                Asked Questions
              </div>

              <div className="content-16">
                <div className="content-17">
                  <div className="content-18">
                    <p className="text-28">
                      Have another question? Please contact our team!
                    </p>
                  </div>
                </div>

                <Button
                  className="instance-node-7"
                  size="normal"
                  text="Contact Our Team"
                  type="outlined"
                />
              </div>

              <div className="frame-11">
                <div className="faq-accordion-list">
                  {faqData.map((faq, index) => (
                    <div
                      key={index}
                      className={`faq-accordion-item ${openFaqIndex === index ? "faq-open" : ""}`}
                    >
                      <button
                        className="faq-question-button"
                        onClick={() => toggleFaq(index)}
                        aria-expanded={openFaqIndex === index}
                        aria-controls={`faq-answer-mobile-${index}`}
                      >
                        <span className="faq-question-text">
                          {index === 2 ? (
                            <>
                              How do you keep docs accurate and up to <br />date?
                            </>
                          ) : index === 4 ? (
                            <>
                              Do you train AI models on our company <br />data?
                            </>
                          ) : (
                            faq.question
                          )}
                        </span>
                        <span className={`faq-arrow ${openFaqIndex === index ? "faq-arrow-open" : ""}`}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 9L12 15L18 9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                      <div
                        id={`faq-answer-mobile-${index}`}
                        className="faq-answer"
                        aria-hidden={openFaqIndex !== index}
                      >
                        <div className="faq-answer-content">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="footer-3">
              <div className="content-19">
                <div className="content-20">
                  <div className="logo-instance-wrapper">
                    <Logo
                      className="logo-3"
                      fill="/img/fill-1.svg"
                      fill1="/img/fill-2-6.svg"
                      fillClassName="logo-4"
                      fillClassNameOverride="logo-4"
                      img="/img/fill-3-5.svg"
                      state="white"
                    />
                  </div>
                </div>

                <div className="form-email-2">
                  <div className="text-wrapper-13">Enter Your Email</div>

                  <div className="rectangle-2" />

                  <button className="btn-2">
                    <div className="text-wrapper-14">Subscribe</div>
                  </button>
                </div>

                <p className="text-wrapper-15">
                  Subscribe for updates on new features, workflow tips, and
                  smarter ways to keep docs up to date.
                </p>
              </div>

              <div className="content-21">
                <div className="text-29">© Copyright ScopeDocs 2026</div>

                <div className="content-groups-5">
                  <div className="text-29">Privacy Policy</div>

                  <div className="text-30">Legal</div>

                  <div className="text-30">Term of Services</div>
                </div>
              </div>
            </div>
          </div>

          <div className="frame-12">
            <div className="frame-13">
              <img
                className="frame-14"
                alt="Frame"
                src="/img/frame-427322178-2.png"
              />

              <div className="frame-15">
                <div className="text-wrapper-16">Microsoft Teams</div>

                <div className="text-wrapper-17">Collaboration Platform</div>
              </div>
            </div>

            <div className="frame-13">
              <div className="frame-14">
                <div className="ellipse-4" />

                <img
                  className="image-3"
                  alt="Image"
                  src="/img/image-588254642.png"
                />
              </div>

              <div className="frame-15">
                <div className="text-wrapper-16">Zoom</div>

                <div className="text-wrapper-17">Video Conferencing</div>
              </div>
            </div>

            <div className="frame-13">
              <div className="frame-14">
                <div className="ellipse-5" />

                <Slack className="slack-1" />
              </div>

              <div className="frame-15">
                <div className="text-wrapper-16">Slack</div>

                <div className="text-wrapper-17">Software Type</div>
              </div>
            </div>

            <div className="frame-13">
              <img
                className="frame-14"
                alt="Frame"
                src="/img/frame-427322178-3.png"
              />

              <div className="frame-15">
                <div className="text-wrapper-16">Google Drive</div>

                <p className="text-wrapper-17">
                  Cloud storage and File Sharing
                </p>
              </div>
            </div>
          </div>

          <div className="frame-16">
            <div className="frame-13">
              <div className="frame-14">
                <div className="ellipse-5" />

                <JiraCoreWrapper />
              </div>

              <div className="frame-15">
                <div className="text-wrapper-16">Jira</div>

                <div className="text-wrapper-17">Work Management Platform</div>
              </div>
            </div>

            <div className="frame-13">
              <div className="frame-14">
                <div className="ellipse-5" />

                <NotionWrapper />
              </div>

              <div className="frame-15">
                <div className="text-wrapper-16">Notion</div>

                <div className="text-wrapper-17">Note-taking App</div>
              </div>
            </div>

            <div className="frame-13">
              <div className="frame-14">
                <div className="ellipse-6" />

                <SocialIcons1 className="social-icons" />
              </div>

              <div className="frame-15">
                <div className="text-wrapper-16">Github</div>

                <div className="text-wrapper-17">Development Platform</div>
              </div>
            </div>

            <div className="frame-13">
              <div className="frame-14">
                <div className="ellipse-6" />

                <div className="dropbox-2">
                  <div className="bg" />
                  <img
                    className="dropbox-4"
                    alt="Dropbox"
                    src="/img/dropbox.svg"
                  />
                </div>
              </div>

              <div className="frame-15">
                <div className="text-wrapper-16">Dropbox</div>

                <p className="text-wrapper-17">
                  Cloud storage and File Sharing
                </p>
              </div>
            </div>
          </div>

          <img className="element" alt="Element" src="/img/1card-1.png" />

          {/* PRICING SECTION - Temporarily disabled. Set SHOW_PRICING to true to re-enable. */}
          {SHOW_PRICING && (
            <div className="content-groups-6">
              <div className="pricing-card">
              <div className="group-4">
                <div className="content-22">
                  <div className="content-17">
                    <div className="content-23">
                      <button className="button-3">
                        <div className="text-10">Starter</div>
                      </button>

                      <p className="subheadline">
                        Perfect for small businesses or individuals
                      </p>

                      <div className="price">
                        <div className="number">$0</div>

                        <div className="details">/ month</div>
                      </div>
                    </div>
                  </div>

                  <div className="content-24">
                    <div className="divider" />

                    <div className="content-23">
                      <div className="features-headline">Features include:</div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="white" />
                        <p className="text-31">
                          1 workspace, basic doc generation
                        </p>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="white" />
                        <p className="text-31">
                          Turn Slack threads into summaries and decision notes
                        </p>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="white" />
                        <p className="text-31">
                          Manual refresh (generate on demand)
                        </p>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="white" />
                        <div className="text-31">
                          Search across generated docs
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="button-10"
                    size="normal"
                    text="Get Started"
                    textClassName="button-9"
                    type="outlined"
                  />
                </div>
              </div>
            </div>

            <div className="pricing-card">
              <div className="group-5">
                <div className="content-22">
                  <div className="content-17">
                    <div className="content-23">
                      <button className="button-3">
                        <div className="text-10">Premium</div>
                      </button>

                      <p className="subheadline-2">
                        Best for teams that want docs to stay up to date
                        automatically
                      </p>

                      <div className="price">
                        <div className="number-2">$35</div>

                        <div className="details-2">/ month</div>
                      </div>
                    </div>
                  </div>

                  <div className="content-24">
                    <div className="divider-2" />

                    <div className="content-23">
                      <div className="features-headline-2">Feautures</div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="#0A0A0A" />
                        <p className="text-32">
                          Up to 10 Slack channels connected
                        </p>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="#0A0A0A" />
                        <div className="text-32">Unlimited doc generations</div>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="#0A0A0A" />
                        <div className="text-32">Auto-update docs</div>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="#0A0A0A" />
                        <p className="text-32">
                          Team knowledge hub (shared workspace)
                        </p>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="#0A0A0A" />
                        <div className="text-32">
                          Role-based access (permissions-visibility)
                        </div>
                      </div>

                      <div className="content-25">
                        <Checkcircle className="check-circle" color="#090909" />
                        <p className="text-33">
                          API access for custom workflows
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="button-11"
                    size="normal"
                    text="Get Started"
                    textClassName="instance-node-6"
                    type="outlined"
                  />
                </div>
              </div>
            </div>
            </div>
          )}

          {/* PRICING HEADER - Temporarily disabled. Set SHOW_PRICING to true to re-enable. */}
          {SHOW_PRICING && (
            <div className="content-26">
              <p className="text-26">
                Flexible Plans for Every Team
                <br />
                No Extra Hidden Fees
              </p>

              <p className="text-25">
                Know exactly what you&#39;re paying for, with no surprises or
                hidden costs
              </p>
            </div>
          )}
        </>
      )}

      {screenWidth >= 1024 && screenWidth < 1440 && (
        <>
          <div className="container-5">
            <div className="hero-2">
              <img className="lights-2" alt="Lights" src="/img/lights-2.svg" />

              <div className="container-6">
                <div className="navbar-2">
                  <div className="div-3">
                    <Logo
                      className="logo-3"
                      fill="/img/fill-1-7.svg"
                      fill1="/img/fill-2-7.svg"
                      img="/img/fill-3-7.svg"
                      state="white"
                    />
                  </div>

                  <div className="nav-link-2">
                    <div className="menu-2">
                      <div className="text-34">About</div>
                    </div>

                    <div className="menu-2" onClick={() => {
                      const element = document.getElementById('smart-solutions');
                      if (element) {
                        const offset = 120;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}>
                      <div className="text-34">Features</div>
                    </div>

                    <div className="menu-3">
                      <div className="text-34">Pricing</div>
                    </div>

                    <a href="mailto:hello@scopedocs.ai?subject=ScopeDocs%20Inquiry" className="menu-2">
                      <div className="text-34">Contact Us</div>
                    </a>
                  </div>

                  <Button
                    className="button-12"
                    size="normal"
                    text="Book Demo"
                    textClassName="button-13"
                    type="secondary"
                    href={screenWidth >= 1440 ? "https://calendar.app.google/hdAMUpqTcD2uzbHx9" : undefined}
                  />
                </div>

                <div className="content-27">
                  <div className="content-28">
                    <button className="button-3">
                      <div className="group-3">
                        <div className="frame-2" />

                        <div className="frame-3" />

                        <div className="frame-4" />

                        <div className="frame-5" />
                      </div>

                      <div className="text-10">Backed by Character Capital</div>
                    </button>

                    <div className="content-29">
                      <div className="text-35">
                        Know your code,
                        <br />
                        within minutes
                      </div>

                      <p className="text-36">
                        <span className="span">ScopeDocs </span>

                        <span className="text-wrapper-5">
                          turns your team’s daily work into always{" "}
                        </span>

                        <span className="span">current internal docs</span>

                        <span className="text-wrapper-5">, </span>

                        <span className="text-wrapper-6">no extra effort.</span>
                      </p>
                    </div>
                  </div>

                  <form className="input-2" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      className="email-input"
                      placeholder="Email Address Here"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <button 
                      type="submit" 
                      className="button-14" 
                      disabled={isSubmitting}
                      onClick={handleCtaClick}
                    >
                      <div className="text-wrapper-7">
                        {isSubmitting ? 'Submitting...' : 'Get Started Now'}
                      </div>
                    </button>
                  </form>
                </div>

                <img
                  className="clip-path-group"
                  alt="Clip path group"
                  src="/img/clip-path-group.png"
                />

                <img
                  className="element-card"
                  alt="Element"
                  src="/img/1card-1.png"
                />
              </div>
            </div>

            <div className="why-choose-us-2" id="smart-solutions">
              <div className="content-30">
                <div className="text-37">
                  Smart Solutions for
                  <br />
                  Code Documentation
                </div>

                <p className="text-25">
                  Stay organized, prioritize tasks, and achieve your goals
                  effortlessly.
                </p>
              </div>

              <div className="content-groups-7">
                <WhyChooseUsCard
                  caretright4Color="#FAFAFA"
                  className="instance-node-8"
                  icon={
                    <CatppuccinFolderDocs2 className="catppuccin-folder-docs-2" />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text="Living Docs"
                  text1="Connect Slack, GitHub PRs, Jira/Linear tickets, and specs, and ScopeDocs keeps internal docs current as work changes."
                  version="one"
                />
                <WhyChooseUsCard
                  caretright4Color="#FAFAFA"
                  className="why-choose-us-card-7"
                  icon={
                    <FormatOutlineWeightRegular7
                      className="instance-node-5"
                      color="white"
                    />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text2="Your Team’s Way"
                  text3="Match your org’s structure, services, and processes, without forcing a new workflow or rigid templates."
                  version="two"
                />
                <WhyChooseUsCard
                  caretright4Color="#0A0A0A"
                  className="instance-node-8"
                  icon={
                    <FluentPeopleTeam16Regular
                      className="fluent-people-team"
                      color="white"
                    />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text4="Shareable Context"
                  text5="Create clean pages people can hand off, onboard with, and reference later, with links back to the original sources."
                  version="three"
                />
                <WhyChooseUsCard
                  caretright4Color="white"
                  className="why-choose-us-card-7"
                  icon={<Chartbar className="instance-node-5" color="white" />}
                  iconContainerClassName="why-choose-us-card-2"
                  text6="Change Intelligence"
                  text7="See what changed, why it changed, and what it might affect, all source-linked so it’s easy to track."
                  textClassName="instance-node-6"
                  version="four"
                />
              </div>
            </div>
          </div>

          <div className="v-2">
            <div className="frame-17">
              <div className="frame-13">
                <img
                  className="frame-14"
                  alt="Frame"
                  src="/img/frame-427322178-2.png"
                />

                <div className="frame-15">
                  <div className="text-wrapper-16">Microsoft Teams</div>

                  <div className="text-wrapper-17">Collaboration Platform</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-4" />

                  <img
                    className="image-3"
                    alt="Image"
                    src="/img/image-588254642.png"
                  />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Zoom</div>

                  <div className="text-wrapper-17">Video Conferencing</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <Slack className="slack-1" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Slack</div>

                  <div className="text-wrapper-17">Software Type</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <SocialIcons1 className="social-icons" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Github</div>

                  <div className="text-wrapper-17">Development Platform</div>
                </div>
              </div>
            </div>

            <div className="frame-18">
              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <JiraCoreWrapper />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Jira</div>

                  <div className="text-wrapper-17">
                    Work Management Platform
                  </div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <Notion1 className="notion-1" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Notion</div>

                  <div className="text-wrapper-17">Note-taking App</div>
                </div>
              </div>

              <div className="frame-13">
                <img
                  className="frame-14"
                  alt="Frame"
                  src="/img/frame-427322178-7.svg"
                />

                <div className="frame-15">
                  <div className="text-wrapper-16">Google Drive</div>

                  <p className="text-wrapper-18">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <div className="dropbox-2">
                    <div className="bg" />

                    <img
                      className="dropbox-3"
                      alt="Dropbox"
                      src="/img/dropbox-3.svg"
                    />
                  </div>
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Dropbox</div>

                  <p className="text-wrapper-17">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>
            </div>

            <div className="content-31">
              <div className="text-37">
                Works with the tools
                <br />
                you already use
              </div>
              <p className="text-25">
                Sync your stack in minutes, turn PRs, tickets, and threads into living docs
              </p>
            </div>
          </div>
        </>
      )}

      {screenWidth >= 1440 && (
        <>
          <div className="container-7">
            <div className="hero-3">
              <img className="lights-3" alt="Lights" src="/img/lights.svg" />

              <div className="container-8">
                <Navbar
                  buttonSizeNormalTypeClassName="navbar-4"
                  buttonText="Book Demo"
                  className="navbar-instance"
                  hasMenu={false}
                  logoFill="/img/fill-3-4.svg"
                  logoFill1="/img/fill-1-4.svg"
                  logoImg="/img/fill-2-4.svg"
                  menuClassName="navbar-3"
                />
                <div className="content-32">
                  <div className="content-33">
                    <button className="button-3">
                      <div className="group-3">
                        <div className="frame-2" />

                        <div className="frame-3" />

                        <div className="frame-4" />

                        <div className="frame-5" />
                      </div>

                      <div className="text-10">Backed by Character Capital</div>
                    </button>

                    <div className="content-29">
                      <div className="text-38">
                        Know your code,
                        <br />
                        within minutes
                      </div>

                      <p className="text-39">
                        <span className="span">ScopeDocs </span>

                        <span className="text-wrapper-5">
                          turns your team’s daily work into always{" "}
                        </span>

                        <span className="span">current internal docs</span>

                        <span className="text-wrapper-5">, </span>

                        <span className="text-wrapper-6">no extra effort.</span>
                      </p>
                    </div>
                  </div>

                  <form className="input-3" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      className="email-input"
                      placeholder="Email Address Here"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <button 
                      type="submit" 
                      className="button-14" 
                      disabled={isSubmitting}
                      onClick={handleCtaClick}
                    >
                      <div className="text-wrapper-7">
                        {isSubmitting ? 'Submitting...' : 'Get Started Now'}
                      </div>
                    </button>
                  </form>
                </div>

                <img
                  className="element-2"
                  alt="Element"
                  src="/img/1card-1.png"
                />
              </div>
            </div>

            <div className="why-choose-us-3" id="smart-solutions">
              <div className="content-30">
                <div className="text-37">
                  Smart Solutions for
                  <br />
                  Code Documentation
                </div>

                <p className="text-25">
                  Stay organized, prioritize tasks, and achieve your goals
                  effortlessly.
                </p>
              </div>

              <div className="content-groups-7">
                <WhyChooseUsCard
                  caretright4Color="#FAFAFA"
                  className="instance-node-8"
                  icon={
                    <CatppuccinFolderDocs2 className="catppuccin-folder-docs-2" />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text="Living Docs"
                  text1="Connect Slack, GitHub PRs, Jira/Linear tickets, and specs, and ScopeDocs keeps internal docs current as work changes."
                  version="one"
                />
                <WhyChooseUsCard
                  caretright4Color="#FAFAFA"
                  className="why-choose-us-card-8"
                  icon={
                    <FormatOutlineWeightRegular7
                      className="instance-node-5"
                      color="white"
                    />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text2="Your Team’s Way"
                  text3="Match your org’s structure, services, and processes, without forcing a new workflow or rigid templates."
                  version="two"
                />
                <WhyChooseUsCard
                  caretright4Color="#0A0A0A"
                  className="instance-node-8"
                  icon={
                    <FluentPeopleTeam16Regular
                      className="fluent-people-team"
                      color="white"
                    />
                  }
                  iconContainerClassName="why-choose-us-card-2"
                  text4="Shareable Context"
                  text5="Create clean pages people can hand off, onboard with, and reference later, with links back to the original sources."
                  version="three"
                />
                <WhyChooseUsCard
                  caretright4Color="white"
                  className="why-choose-us-card-8"
                  icon={<Chartbar className="instance-node-5" color="white" />}
                  iconContainerClassName="why-choose-us-card-2"
                  text6="Change Intelligence"
                  text7="See what changed, why it changed, and what it might affect, all source-linked so it’s easy to track."
                  textClassName="instance-node-6"
                  version="four"
                />
              </div>
            </div>
          </div>

          <div className="v-3">
            <div className="frame-19">
              <div className="frame-13">
                <img
                  className="frame-14"
                  alt="Frame"
                  src="/img/frame-427322178.svg"
                />

                <div className="frame-15">
                  <div className="text-wrapper-16">Microsoft Teams</div>

                  <div className="text-wrapper-17">Collaboration Platform</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-4" />

                  <img
                    className="image-3"
                    alt="Image"
                    src="/img/image-588254642.png"
                  />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Zoom</div>

                  <div className="text-wrapper-17">Video Conferencing</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <Slack className="slack-1" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Slack</div>

                  <div className="text-wrapper-17">Software Type</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <SocialIcons1 className="social-icons" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Github</div>

                  <div className="text-wrapper-17">Development Platform</div>
                </div>
              </div>
            </div>

            <div className="frame-20">
              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <JiraCore2
                    className="jira-core-5"
                    color="url(#paint0_linear_117331_7702)"
                  />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Jira</div>

                  <div className="text-wrapper-17">
                    Work Management Platform
                  </div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <Notion1 className="notion-1" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Notion</div>

                  <div className="text-wrapper-17">Note-taking App</div>
                </div>
              </div>

              <div className="frame-13">
                <img
                  className="frame-14"
                  alt="Frame"
                  src="/img/frame-427322178-1.svg"
                />

                <div className="frame-15">
                  <div className="text-wrapper-16">Google Drive</div>

                  <p className="text-wrapper-18">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <div className="dropbox-2">
                    <div className="bg" />

                    <img
                      className="dropbox-4"
                      alt="Dropbox"
                      src="/img/dropbox.svg"
                    />
                  </div>
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Dropbox</div>

                  <p className="text-wrapper-17">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>
            </div>

            <div className="content-34">
              <div className="text-37">
                Works with the tools
                <br />
                you already use
              </div>
              <p className="text-25">
                Sync your stack in minutes, turn PRs, tickets, and threads into living docs.
              </p>
            </div>
          </div>
        </>
      )}

      {((screenWidth >= 1024 && screenWidth < 1440) || screenWidth >= 1440) && (
        <>
          <div className="features">
            <div
              className="content-35"
              style={{
                width:
                  screenWidth >= 1024 && screenWidth < 1440
                    ? "364px"
                    : screenWidth >= 1440
                      ? "660px"
                      : undefined,
              }}
            >
              <div className="content-18">
                <p className="text-40">
                  Turn Work Into <br />
                  Living Docs
                </p>

                <p className="text-41">
                  <span className="text-wrapper-8">ScopeDocs </span>

                  <span className="text-wrapper-9">
                    automatically generates documentation
                  </span>

                  <span className="text-wrapper-8"> from your </span>

                  <span className="text-wrapper-9">
                    Slack threads, tickets, and code changes
                  </span>

                  <span className="text-wrapper-10">,</span>

                  <span className="text-wrapper-8">
                    {" "}
                    then keeps it continuously updated as work evolves. No{" "}
                  </span>

                  <span className="text-wrapper-9">manual writing</span>

                  <span className="text-wrapper-8">, no </span>

                  <span className="text-wrapper-11">outdated wikis</span>
                </p>
              </div>
            </div>

            <div
              className="image-wrapper"
              style={{
                marginRight:
                  screenWidth >= 1024 && screenWidth < 1440
                    ? "-1.00px"
                    : screenWidth >= 1440
                      ? "-42.00px"
                      : undefined,
                width:
                  screenWidth >= 1024 && screenWidth < 1440
                    ? "469px"
                    : screenWidth >= 1440
                      ? "630px"
                      : undefined,
              }}
            >
              <div
                className="container-wrapper"
                style={{
                  height:
                    screenWidth >= 1024 && screenWidth < 1440
                      ? "542px"
                      : screenWidth >= 1440
                        ? "500px"
                        : undefined,
                  marginLeft:
                    screenWidth >= 1024 && screenWidth < 1440
                      ? "-54.00px"
                      : undefined,
                  marginRight:
                    screenWidth >= 1024 && screenWidth < 1440
                      ? "-54.00px"
                      : undefined,
                  width:
                    screenWidth >= 1024 && screenWidth < 1440
                      ? "577px"
                      : screenWidth >= 1440
                        ? "620px"
                        : undefined,
                }}
              >
                <div className="container-9">
                  <TopBarLight
                    className="top-bar-light-instance"
                    iconClassName="top-bar-light-2"
                    style="dark"
                  />
                  <div className="task-dashboard-2">
                    <div className="button-15">
                      <div className="text-16">In Progress</div>

                      <div className="div-3">
                        <Plus format="outline" weight="bold" />
                        <DotsThreeOutline format="outline" weight="fill" />
                      </div>
                    </div>

                    <div className="button-16">
                      <div className="text-16">Done</div>

                      <div className="div-3">
                        <Plus format="outline" weight="bold" />
                        <DotsThreeOutline format="outline" weight="fill" />
                      </div>
                    </div>

                    <div className="card">
                      <div className="header">
                        <button className="button-7">
                          <div className="text-17">Medium</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Organize and Lead the Team Feedback Session for
                          Project
                        </p>

                        <p className="text-19">
                          Schedule a meeting to gather feedback on the latest
                          project designs.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-2" />

                          <div className="avatar-3" />

                          <div className="avatar-3" />

                          <div className="avatar-4">
                            <div className="text-20">+2</div>
                          </div>
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">2</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-2">
                      <div className="header">
                        <button className="button-7">
                          <div className="text-17">Medium</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Revise and Update Marketing Campaign Assets for the
                          Holiday
                        </p>

                        <p className="text-19">
                          Adjust ad visuals and copy to align with the holiday
                          campaign goals.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-2" />

                          <div className="avatar-5" />
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">5</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-3">
                      <div className="header">
                        <button className="button-8">
                          <div className="text-21">High</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Draft a Comprehensive Blog Post on Task Management
                          Strategies
                        </p>

                        <p className="text-19">
                          Write a 500-word blog post offering tips for better
                          task management.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-6" />
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">2</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-4">
                      <div className="header">
                        <button className="button-8">
                          <div className="text-21">High</div>
                        </button>
                      </div>

                      <div className="content-10">
                        <p className="text-18">
                          Prepare Scripts and Recruit Participants for Usability
                          Testing
                        </p>

                        <p className="text-19">
                          Set up user testing procedures to evaluate the
                          app&#39;s functionality.
                        </p>
                      </div>

                      <div className="footer-2">
                        <div className="content-groups-3">
                          <div className="avatar-2" />

                          <div className="avatar-3" />

                          <div className="avatar-3" />

                          <div className="avatar-4">
                            <div className="text-20">+1</div>
                          </div>
                        </div>

                        <div className="content-groups-4">
                          <div className="content-11">
                            <Chat format="outline" weight="regular" />
                            <div className="text-wrapper-12">6</div>
                          </div>

                          <div className="content-11">
                            <Link format="outline" weight="regular" />
                            <div className="text-wrapper-12">3</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <img
                      className="software-developer-3"
                      alt="Software developer"
                      src="/img/software-developer-coding-on-laptop-2025-01-29-08-37-09-utc-1.png"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature">
            <div
              className="image-4"
              style={{
                width:
                  screenWidth >= 1440
                    ? "620px"
                    : screenWidth >= 1024 && screenWidth < 1440
                      ? "511px"
                      : undefined,
              }}
            >
              <div className="container-9">
                <TopBarLight
                  className="top-bar-light-instance"
                  iconClassName="top-bar-light-2"
                  style="dark"
                />
                <div
                  className="task-dashboard-3"
                  style={{
                    height:
                      screenWidth >= 1440
                        ? "429px"
                        : screenWidth >= 1024 && screenWidth < 1440
                          ? "445px"
                          : undefined,
                    width:
                      screenWidth >= 1440
                        ? "588px"
                        : screenWidth >= 1024 && screenWidth < 1440
                          ? "479px"
                          : undefined,
                  }}
                >
                  <div className="button-15">
                    <div className="text-16">In Progress</div>

                    <div className="div-3">
                      <Plus format="outline" weight="bold" />
                      <DotsThreeOutline format="outline" weight="fill" />
                    </div>
                  </div>

                  <div className="button-16">
                    <div className="text-16">Done</div>

                    <div className="div-3">
                      <Plus format="outline" weight="bold" />
                      <DotsThreeOutline format="outline" weight="fill" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="header">
                      <button className="button-7">
                        <div className="text-17">Medium</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Organize and Lead the Team Feedback Session for Project
                      </p>

                      <p className="text-19">
                        Schedule a meeting to gather feedback on the latest
                        project designs.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-2" />

                        <div className="avatar-3" />

                        <div className="avatar-3" />

                        <div className="avatar-4">
                          <div className="text-20">+2</div>
                        </div>
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">2</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-2">
                    <div className="header">
                      <button className="button-7">
                        <div className="text-17">Medium</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Revise and Update Marketing Campaign Assets for the
                        Holiday
                      </p>

                      <p className="text-19">
                        Adjust ad visuals and copy to align with the holiday
                        campaign goals.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-2" />

                        <div className="avatar-5" />
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">5</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-3">
                    <div className="header">
                      <button className="button-8">
                        <div className="text-21">High</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Draft a Comprehensive Blog Post on Task Management
                        Strategies
                      </p>

                      <p className="text-19">
                        Write a 500-word blog post offering tips for better task
                        management.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-6" />
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">2</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-4">
                    <div className="header">
                      <button className="button-8">
                        <div className="text-21">High</div>
                      </button>
                    </div>

                    <div className="content-10">
                      <p className="text-18">
                        Prepare Scripts and Recruit Participants for Usability
                        Testing
                      </p>

                      <p className="text-19">
                        Set up user testing procedures to evaluate the app&#39;s
                        functionality.
                      </p>
                    </div>

                    <div className="footer-2">
                      <div className="content-groups-3">
                        <div className="avatar-2" />

                        <div className="avatar-3" />

                        <div className="avatar-3" />

                        <div className="avatar-4">
                          <div className="text-20">+1</div>
                        </div>
                      </div>

                      <div className="content-groups-4">
                        <div className="content-11">
                          <Chat format="outline" weight="regular" />
                          <div className="text-wrapper-12">6</div>
                        </div>

                        <div className="content-11">
                          <Link format="outline" weight="regular" />
                          <div className="text-wrapper-12">3</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <img
                    className="software-developer-4"
                    alt="Software developer"
                    src="/img/software-developer-coding-on-laptop-2025-01-29-08-37-09-utc-1-1.png"
                  />
                </div>
              </div>
            </div>

            <div
              className="content-36"
              style={{
                marginRight:
                  screenWidth >= 1024 && screenWidth < 1440
                    ? "-17.00px"
                    : undefined,
                width:
                  screenWidth >= 1440
                    ? "596px"
                    : screenWidth >= 1024 && screenWidth < 1440
                      ? "306px"
                      : undefined,
              }}
            >
              <div className="content-18">
                <p className="text-42">Find Answers in Seconds, With Sources</p>

                <p className="text-43">
                  Ask a question and get a decision-ready answer backed by
                  source links, owners, and timestamps. Every summary is
                  traceable to the exact conversation, PR, or ticket, so teams
                  can trust it, share it, and move faster.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {screenWidth >= 1440 && (
        <>
          <div className="testimonials">
            <div className="content-30">
              <p className="text-37">
                What users <br />
                Say about ScopeDocs
              </p>

              <p className="text-25">
                Our users success stories highlight the real value
              </p>
            </div>

            <div className="content-groups-8">
              <div className="row-4">
                <TestimonialCard
                  avatarClassName="testimonial-card-2"
                  className="instance-node-8"
                  logo="/img/logo-3.svg"
                  text="&#34;I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what’s going to happen…because this has been really difficult for us to get LLMs to [document] this well.”"
                  text1="Sarah Thompson"
                  text2="COO"
                  version="one"
                />
                <TestimonialCard
                  avatarClassName="testimonial-card-5"
                  className="testimonial-card-8"
                  text="&#34;I&#39;ve paid for a lot of project management tools, but what caught my attention was that your product was generative documentation!&#34;"
                  text1="David K"
                  text2="Software Development Engineer"
                  vector="/img/vector-23.svg"
                  vectorClassName="testimonial-card-3"
                  version="eight"
                />
                <TestimonialCard
                  avatarClassName="testimonial-card-7"
                  className="testimonial-card-8"
                  img="/img/logo-5.svg"
                  text="We finally have documentation that stays current. When tickets and PRs change, ScopeDocs keeps the docs aligned with reality."
                  text1="Alexa R."
                  text2="VP of Engineering"
                  version="three"
                />
              </div>
            </div>
          </div>

          {/* PRICING SECTION - Temporarily disabled. Set SHOW_PRICING to true to re-enable. */}
          {SHOW_PRICING && (
            <div className="pricing-2">
              <div className="content-30">
                <p className="text-37">
                  Flexible Plans for Every Team
                  <br />
                  No Extra Hidden Fees
                </p>

                <p className="text-25">
                  Know exactly what you&#39;re paying for, with no surprises or
                  hidden costs
                </p>
              </div>

              <div className="content-groups-7">
              <div className="group-wrapper">
                <div className="group-6">
                  <div className="content-22">
                    <div className="content-17">
                      <div className="content-23">
                        <button className="button-3">
                          <div className="text-10">Starter</div>
                        </button>

                        <p className="subheadline">
                          Perfect for small businesses or individuals
                        </p>

                        <div className="price">
                          <div className="number">$0</div>

                          <div className="details">/ month</div>
                        </div>
                      </div>
                    </div>

                    <div className="content-24">
                      <div className="divider-3" />

                      <div className="content-23">
                        <div className="features-headline">
                          Features include:
                        </div>

                        <div className="content-25">
                          <Checkcircle className="check-circle" color="white" />
                          <p className="text-31">
                            1 workspace, basic doc generation
                          </p>
                        </div>

                        <div className="content-25">
                          <Checkcircle className="check-circle" color="white" />
                          <p className="text-31">
                            Turn Slack threads into summaries and decision notes
                          </p>
                        </div>

                        <div className="content-25">
                          <Checkcircle className="check-circle" color="white" />
                          <p className="text-31">
                            Manual refresh (generate on demand)
                          </p>
                        </div>

                        <div className="content-25">
                          <Checkcircle className="check-circle" color="white" />
                          <div className="text-31">
                            Search across generated docs
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="button-10"
                      size="normal"
                      text="Get Started"
                      textClassName="button-9"
                      type="outlined"
                    />
                  </div>
                </div>
              </div>

              <div className="group-wrapper">
                <div className="group-7">
                  <div className="content-22">
                    <div className="content-17">
                      <div className="content-23">
                        <button className="button-3">
                          <div className="text-10">Premium</div>
                        </button>

                        <p className="subheadline-2">
                          Best for teams that want docs to stay up to date
                          automatically
                        </p>

                        <div className="price">
                          <div className="number-2">$35</div>

                          <div className="details-2">/ month</div>
                        </div>
                      </div>
                    </div>

                    <div className="content-24">
                      <div className="divider-4" />

                      <div className="content-23">
                        <div className="features-headline-2">Feautures</div>

                        <div className="content-25">
                          <Checkcircle
                            className="check-circle"
                            color="#0A0A0A"
                          />
                          <p className="text-32">
                            Up to 10 Slack channels connected
                          </p>
                        </div>

                        <div className="content-25">
                          <Checkcircle
                            className="check-circle"
                            color="#0A0A0A"
                          />
                          <div className="text-32">
                            Unlimited doc generations
                          </div>
                        </div>

                        <div className="content-25">
                          <Checkcircle
                            className="check-circle"
                            color="#0A0A0A"
                          />
                          <div className="text-32">Auto-update docs</div>
                        </div>

                        <div className="content-25">
                          <Checkcircle
                            className="check-circle"
                            color="#0A0A0A"
                          />
                          <p className="text-32">
                            Team knowledge hub (shared workspace)
                          </p>
                        </div>

                        <div className="content-25">
                          <Checkcircle
                            className="check-circle"
                            color="#0A0A0A"
                          />
                          <div className="text-32">
                            Role-based access (permissions-visibility)
                          </div>
                        </div>

                        <div className="content-25">
                          <Checkcircle
                            className="check-circle"
                            color="#090909"
                          />
                          <p className="text-33">
                            API access for custom workflows
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="button-11"
                      size="normal"
                      text="Get Started"
                      textClassName="instance-node-6"
                      type="outlined"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          <div className="FA-qs">
            <div className="content-37">
              <div className="content-17">
                <div className="content-18">
                  <div className="text-44">
                    Frequently
                    <br />
                    Asked Questions
                  </div>

                  <p className="text-43">
                    Have another question? Please contact our team!
                  </p>
                </div>
              </div>

              <Button
                className="instance-node-7"
                size="normal"
                text="Contact Our Team"
                type="outlined"
              />
            </div>

            <div className="content-groups-9">
              <div className="faq-accordion-list">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-accordion-item ${openFaqIndex === index ? "faq-open" : ""}`}
                  >
                      <button
                        className="faq-question-button"
                        onClick={() => toggleFaq(index)}
                        onKeyDown={(e) => handleFaqKeyDown(e, index)}
                        aria-expanded={openFaqIndex === index}
                        aria-controls={`faq-answer-${index}`}
                      >
                      <span className="faq-question-text">{faq.question}</span>
                      <span className={`faq-arrow ${openFaqIndex === index ? "faq-arrow-open" : ""}`}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${index}`}
                      className="faq-answer"
                      aria-hidden={openFaqIndex !== index}
                    >
                      <div className="faq-answer-content">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-wrapper">
            <Footer
              className="footer-instance"
              logoFill="/img/fill-3-5.svg"
              logoImg="/img/fill-2-5.svg"
              socialMedia="/img/social-media.svg"
            />
          </div>
        </>
      )}

      {screenWidth >= 1024 && screenWidth < 1440 && (
        <>
          <div className="v-4">
            <div className="frame-22">
              <div className="frame-13">
                <img
                  className="frame-14"
                  alt="Frame"
                  src="/img/frame-427322178-2.png"
                />

                <div className="frame-15">
                  <div className="text-wrapper-16">Microsoft Teams</div>

                  <div className="text-wrapper-17">Collaboration Platform</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-4" />

                  <img
                    className="image-3"
                    alt="Image"
                    src="/img/image-588254642.png"
                  />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Zoom</div>

                  <div className="text-wrapper-17">Video Conferencing</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <Slack className="slack-1" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Slack</div>

                  <div className="text-wrapper-17">Software Type</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <SocialIcons1 className="social-icons" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Github</div>

                  <div className="text-wrapper-17">Development Platform</div>
                </div>
              </div>
            </div>

            <div className="frame-23">
              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <NotionWrapper />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Notion</div>

                  <div className="text-wrapper-17">Note-taking App</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <JiraCore2
                    className="jira-core-5"
                    color="url(#paint0_linear_117351_13904)"
                  />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Jira</div>

                  <div className="text-wrapper-17">Note-taking App</div>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-5" />

                  <Notion1 className="notion-1" />
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Notion</div>

                  <div className="text-wrapper-17">Note-taking App</div>
                </div>
              </div>

              <div className="frame-13">
                <img
                  className="frame-14"
                  alt="Frame"
                  src="/img/frame-427322178-6.svg"
                />

                <div className="frame-15">
                  <div className="text-wrapper-16">Google Drive</div>

                  <p className="text-wrapper-17">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <div className="dropbox-2">
                    <div className="bg" />

                    <img
                      className="dropbox-4"
                      alt="Dropbox"
                      src="/img/dropbox.svg"
                    />
                  </div>
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Dropbox</div>

                  <p className="text-wrapper-17">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>

              <div className="frame-13">
                <div className="frame-14">
                  <div className="ellipse-6" />

                  <div className="dropbox-2">
                    <div className="bg" />

                    <img
                      className="dropbox-4"
                      alt="Dropbox"
                      src="/img/dropbox-5.png"
                    />
                  </div>
                </div>

                <div className="frame-15">
                  <div className="text-wrapper-16">Dropbox</div>

                  <p className="text-wrapper-17">
                    Cloud storage and File Sharing
                  </p>
                </div>
              </div>
            </div>

            <div className="content-38">
              <div className="text-37">
                Works with the tools
                <br />
                you already use
              </div>
              <p className="text-25">
                Sync your stack in minutes, turn PRs, tickets, and threads into living docs
              </p>
            </div>
          </div>

          {/* PRICING SECTION - Temporarily disabled. Set SHOW_PRICING to true to re-enable. */}
          {SHOW_PRICING && (
            <div className="pricing-2">
              <div className="content-30">
                <p className="text-37">
                  Flexible Plans for Every Team
                  <br />
                  No Extra Hidden Fees
                </p>

                <p className="text-25">
                  Know exactly what you&#39;re paying for, with no surprises or
                  hidden costs
                </p>
              </div>

              <div className="content-groups-7">
                <div className="group-wrapper">
                  <div className="group-6">
                    <div className="content-22">
                      <div className="content-17">
                        <div className="content-23">
                          <button className="button-3">
                            <div className="text-10">Starter</div>
                          </button>

                          <p className="subheadline">
                            Perfect for small businesses or individuals
                          </p>

                          <div className="price">
                            <div className="number">$0</div>

                            <div className="details">/ month</div>
                          </div>
                        </div>
                      </div>

                      <div className="content-24">
                        <div className="divider-3" />

                        <div className="content-23">
                          <div className="features-headline">
                            Features include:
                          </div>

                          <div className="content-25">
                            <Checkcircle className="check-circle" color="white" />
                            <p className="text-31">
                              1 workspace, basic doc generation
                            </p>
                          </div>

                          <div className="content-25">
                            <Checkcircle className="check-circle" color="white" />
                            <p className="text-31">
                              Turn Slack threads into summaries and decision notes
                            </p>
                          </div>

                          <div className="content-25">
                            <Checkcircle className="check-circle" color="white" />
                            <p className="text-31">
                              Manual refresh (generate on demand)
                            </p>
                          </div>

                          <div className="content-25">
                            <Checkcircle className="check-circle" color="white" />
                            <div className="text-31">
                              Search across generated docs
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="button-10"
                        size="normal"
                        text="Get Started"
                        textClassName="button-9"
                        type="outlined"
                      />
                    </div>
                  </div>
                </div>

                <div className="group-wrapper">
                  <div className="group-7">
                    <div className="content-22">
                      <div className="content-17">
                        <div className="content-23">
                          <button className="button-3">
                            <div className="text-10">Premium</div>
                          </button>

                          <p className="subheadline-2">
                            Best for teams that want docs to stay up to date
                            automatically
                          </p>

                          <div className="price">
                            <div className="number-2">$35</div>

                            <div className="details-2">/ month</div>
                          </div>
                        </div>
                      </div>

                      <div className="content-24">
                        <div className="divider-4" />

                        <div className="content-23">
                          <div className="features-headline-2">Feautures</div>

                          <div className="content-25">
                            <Checkcircle
                              className="check-circle"
                              color="#0A0A0A"
                            />
                            <p className="text-32">
                              Up to 10 Slack channels connected
                            </p>
                          </div>

                          <div className="content-25">
                            <Checkcircle
                              className="check-circle"
                              color="#0A0A0A"
                            />
                            <div className="text-32">
                              Unlimited doc generations
                            </div>
                          </div>

                          <div className="content-25">
                            <Checkcircle
                              className="check-circle"
                              color="#0A0A0A"
                            />
                            <div className="text-32">Auto-update docs</div>
                          </div>

                          <div className="content-25">
                            <Checkcircle
                              className="check-circle"
                              color="#0A0A0A"
                            />
                            <p className="text-32">
                              Team knowledge hub (shared workspace)
                            </p>
                          </div>

                          <div className="content-25">
                            <Checkcircle
                              className="check-circle"
                              color="#0A0A0A"
                            />
                            <div className="text-32">
                              Role-based access (permissions-visibility)
                            </div>
                          </div>

                          <div className="content-25">
                            <Checkcircle
                              className="check-circle"
                              color="#090909"
                            />
                            <p className="text-33">
                              API access for custom workflows
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="button-11"
                        size="normal"
                        text="Get Started"
                        textClassName="instance-node-6"
                        type="outlined"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="testimonials">
            <div className="content-30">
              <p className="text-37">
                What users <br />
                Say about ScopeDocs
              </p>

              <p className="text-25">
                Our users success stories highlight the real value
              </p>
            </div>

            <div className="row-5">
              <TestimonialCard
                avatarClassName="testimonial-card-2"
                className="testimonial-card-9"
                logo="/img/logo-8.svg"
                text="&#34;I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what’s going to happen…because this has been really difficult for us to get LLMs to [document] this well.”"
                text1="Sarah Thompson"
                text2="COO"
                version="one"
              />
              <TestimonialCard
                avatarClassName="testimonial-card-5"
                className="testimonial-card-8"
                text="&#34;I&#39;ve paid for a lot of project management tools, but what caught my attention was that your product was generative documentation!&#34;"
                text1="David K"
                text2="Software Development Engineer"
                vector="/img/vector-40.svg"
                vectorClassName="testimonial-card-3"
                version="eight"
              />
              <TestimonialCard
                avatarClassName="testimonial-card-7"
                className="testimonial-card-8"
                img="/img/plus.png"
                logoClassName="testimonial-card-10"
                text="We finally have documentation that stays current. When tickets and PRs change, ScopeDocs keeps the docs aligned with reality."
                text1="Alexa R."
                text2="VP of Engineering"
                version="three"
              />
            </div>
          </div>

          <div className="FA-qs-2">
            <div className="content-37">
              <div className="content-17">
                <div className="content-18">
                  <div className="text-44">
                    Frequently
                    <br />
                    Asked Questions
                  </div>

                  <p className="text-43">
                    Have another question? Please contact our team!
                  </p>
                </div>
              </div>

              <Button
                className="instance-node-7"
                size="normal"
                text="Contact Our Team"
                type="outlined"
              />
            </div>

            <div className="content-groups-10">
              <div className="faq-accordion-list">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-accordion-item ${openFaqIndex === index ? "faq-open" : ""}`}
                  >
                    <button
                      className="faq-question-button"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={openFaqIndex === index}
                      aria-controls={`faq-answer-tablet-${index}`}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <span className={`faq-arrow ${openFaqIndex === index ? "faq-arrow-open" : ""}`}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    <div
                      id={`faq-answer-tablet-${index}`}
                      className="faq-answer"
                      aria-hidden={openFaqIndex !== index}
                    >
                      <div className="faq-answer-content">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Footer
            className="footer-instance"
            contentClassName="footer-4"
            logoFill="/img/fill-3-5.svg"
            logoImg="/img/fill-2-8.svg"
            socialMedia="/img/plus.png"
            socialMediaClassName="footer-5"
          />
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close">
              ×
            </button>
            <h2 className="modal-title">
              {isExistingUser ? "You're Already Signed Up!" : "Welcome to the ScopeDocs Family!"}
            </h2>
            <p className="modal-body">
              {isExistingUser ? (
                submittedEmail ? (
                  <>
                    Thanks, <strong>{submittedEmail}</strong>! You've already signed up for our newsletter. You'll receive updates and product news shortly.
                  </>
                ) : (
                  "You've already signed up for our newsletter. You'll receive updates and product news shortly."
                )
              ) : (
                submittedEmail ? (
                  <>
                    Thanks for signing up, <strong>{submittedEmail}</strong>! We'll send occasional newsletters, product updates, and launch notes. No spam. Unsubscribe anytime.
                  </>
                ) : (
                  "You're in. We'll send occasional newsletters, product updates, and launch notes. No spam. Unsubscribe anytime."
                )
              )}
            </p>
            <button className="modal-button" onClick={closeModal}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
