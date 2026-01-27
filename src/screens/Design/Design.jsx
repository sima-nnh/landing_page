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
import { NewTestimonialCard } from "../../components/NewTestimonialCard";
import { ToolCard } from "../../components/ToolCard";
import { BlogCard } from "../../components/BlogCard";
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
    <div className="design w-full min-h-screen overflow-x-hidden lg:flex lg:flex-col lg:items-start lg:gap-[clamp(80px,9.7vw,140px)]">
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
              <div className="container-2">
                <div className="frame-wrapper">
                  <div className="frame">
                    <div className="content-7">
                      <button className="button-3">
                        <img 
                          className="character-capital-logo" 
                          alt="Character Capital" 
                          src="/img/character_capital_logo.png" 
                        />

                        <div className="text-10">
                          Backed by Character Capital
                        </div>
                      </button>

                      <div className="text-11">
                        Stop Writing Docs
                        <br />
                        Start Automating Them
                      </div>

                      <p className="text-12">
                        <span className="span">ScopeDocs is an AI documentation platform that turns your GitHub, Slack, and Jira activity into a single source of truth automatically</span>
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

          {/* Header Coding Image Block */}
          <div className="header-coding-image-section">
            <div className="header-coding-image-container">
              <img
                src="/img/header_coding_image.png"
                alt="Coding and Documentation"
                className="header-coding-image"
                loading="lazy"
              />
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
                  text="Automated Documentation"
                  text1="Connect Slack, GitHub PRs, and Jira tickets to eliminate manual wiki updates. ScopeDocs syncs with your code changes in real-time to create a single source of truth for your engineering team, ensuring no detail is lost as you ship"
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
                  text2="Flexible Engineering Workflows"
                  text3="Scale with your existing services and org structure without disrupting developer velocity. ScopeDocs integrates directly into your SDLC and documentation workflows, capturing real-time team activity instead of relying on manual templates"
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
                  text4="Automated Developer Onboarding"
                  text5="Build a traceable knowledge base with clean onboarding pages and technical handoffs. Every page is automatically generated with direct links back to the original source threads in Slack or GitHub, providing instant context for new hires"
                  version="three"
                />
                <WhyChooseUsCard
                  caretright4Color="white"
                  className="why-choose-us-card-6"
                  icon={<Chartbar className="instance-node-5" color="white" />}
                  iconContainerClassName="why-choose-us-card-2"
                  text6="Traceable Impact Analysis"
                  text7="See exactly what changed and why. Track the technical impact of every code change with source-linked documentation that shows how PRs and tickets affect your architecture, services, and runbooks"
                  textClassName="instance-node-6"
                  version="four"
                />
              </div>
            </div>
          </div>

          {/* Works with the tools section */}
          <div className="tools-section">
            <div className="tools-section-header">
              <div className="text-37">
                Works with the tools
                <br />
                you already use
              </div>
              <p className="text-25">
                Sync your stack in minutes, turn PRs, tickets, and threads into living docs.
                        </p>
                      </div>

            <div className="tools-grid">
              <ToolCard
                logo={
                  <img
                    src="https://cdn.simpleicons.org/asana/F06A6A"
                    alt="Asana"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Asana"
                category="Project Management"
              />
              <ToolCard
                logo={
                  <img
                    src="/img/image-588254642.png"
                    alt="Zoom"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Zoom"
                category="Video Conferencing"
              />
              <ToolCard
                logo={<Slack className="slack-tool-icon" />}
                toolName="Slack"
                category="Collaboration Platform"
              />
              <ToolCard
                logo={<SocialIcons1 className="github-tool-icon" />}
                toolName="GitHub"
                category="Development Platform"
              />
              <ToolCard
                logo={<JiraCore2 className="jira-tool-icon" />}
                toolName="Jira"
                category="Work Management Platform"
              />
              <ToolCard
                logo={<Notion1 className="notion-tool-icon" />}
                toolName="Notion"
                category="Note-taking App"
              />
              <ToolCard
                logo={
                  <img
                    src="/img/Google_Drive_logo.png"
                    alt="Google Drive"
                    style={{ height: "36px", width: "auto" }}
                  />
                }
                toolName="Google Drive"
                category="Cloud storage and File Sharing"
              />
              <ToolCard
                logo={
                  <img
                    src="/img/microsfot_team_logo.png"
                    alt="Microsoft Teams"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Microsoft Teams"
                category="Collaboration Platform"
              />
            </div>
          </div>

          {/* Blog / Resources Section */}
          <div id="blog-section" className="blog-section">
            <div className="blog-section-header">
              <div className="text-37">
                From the blog
              </div>
              <p className="text-25">
                Practical guides on documentation, developer workflows, and AI that fits into real teams.
                      </p>
                    </div>

            <div className="blog-grid">
              <BlogCard
                imageUrl="/img/coding.png"
                title="Keeping docs up to date as code changes"
                description="Stop your technical docs from falling behind. Learn an automated developer workflow using GitHub PRs and Jira tickets to keep internal documentation current. Improve developer onboarding and ensure technical decisions are never lost"
                meta="5 min read"
              />
              <BlogCard
                imageUrl="/img/collaboration_teams-vs.png"
                title="Answers you can trust, with links to the source"
                description="Summaries are only useful if you can verify them. Learn how to turn threads, tickets, and PR discussions into source-linked answers that your team can check, share, and rely on without second guessing."
                meta="6 min read"
              />
              <BlogCard
                imageUrl="/img/feature.png"
                title="A practical setup for living documentation"
                description="Living docs are not about writing more, they are about staying aligned as things change. This guide covers the patterns teams use to keep specs, runbooks, and architecture notes accurate, even when priorities shift mid-sprint."
                meta="7 min read"
              />
                        </div>
                      </div>

          {/* New Testimonials Section */}
          <div className="testimonials-section">
            <div className="testimonials-section-header">
            <div className="text-37 testimonials-header-text">
                What users
                <br />
                <span className="testimonials-header-gray">Say about ScopeDocs</span>
                        </div>
            <p className="text-25">
                Our users success stories highlight the real value.
                      </p>
                    </div>

            <div className="testimonials-grid">
              <NewTestimonialCard
                quote="I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what's going to happen…because this has been really difficult for us to get LLMs to [document] this well."
                name="Sarah T"
                title="COO"
                avatar="/img/avatar-1.png"
              />
              <NewTestimonialCard
                quote="I've paid for a lot of project management tools, but what caught my attention was that your product was generative documentation!"
                name="David K"
                title="Software Development Engineer"
                avatar="/img/avatar-2.png"
              />
              <NewTestimonialCard
                quote="We finally have documentation that stays current. When tickets and PRs change, ScopeDocs keeps the docs aligned with reality."
                name="Alexa R."
                title="VP of Engineering"
                avatar="/img/avatar-3.png"
              />
            </div>
          </div>

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
                    text="&#34;I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what's going to happen…because this has been really difficult for us to get LLMs to [document] this well.&#34;"
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

              <div className="faq-grid-container">
                <div className="faq-left-column">
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
              </div>

                <div className="faq-right-column">
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
                    href={screenWidth >= 1440 ? "https://calendar.google.com/appointments/schedules/AcZssZ1yqI_HhQODo1FeOZ4yBo2_fl9FnbYOLEaLdd_yM3t7vIht4BJSZm5S2mXQqEf8P3bey9TlQ7KD" : undefined}
                  />
                </div>

                <div className="content-27">
                  <div className="content-28">
                    <button className="button-3">
                      <img 
                        className="character-capital-logo" 
                        alt="Character Capital" 
                        src="/img/character_capital_logo.png" 
                      />

                      <div className="text-10">Backed by Character Capital</div>
                    </button>

                    <div className="content-29">
                      <div className="text-35">
                        Stop Writing Docs
                        <br />
                        Start Automating Them
                      </div>

                      <p className="text-36">
                        <span className="span">ScopeDocs is an AI documentation platform that turns your GitHub, Slack, and Jira activity into a single source of truth automatically</span>
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

            {/* Header Coding Image Block */}
            <div className="header-coding-image-section">
              <div className="header-coding-image-container">
                <img
                  src="/img/header_coding_image.png"
                  alt="Coding and Documentation"
                  className="header-coding-image"
                  loading="lazy"
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
                  text="Automated Documentation"
                  text1="Connect Slack, GitHub PRs, and Jira tickets to eliminate manual wiki updates. ScopeDocs syncs with your code changes in real-time to create a single source of truth for your engineering team, ensuring no detail is lost as you ship"
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
                  text2="Flexible Engineering Workflows"
                  text3="Scale with your existing services and org structure without disrupting developer velocity. ScopeDocs integrates directly into your SDLC and documentation workflows, capturing real-time team activity instead of relying on manual templates"
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
                  text4="Automated Developer Onboarding"
                  text5="Build a traceable knowledge base with clean onboarding pages and technical handoffs. Every page is automatically generated with direct links back to the original source threads in Slack or GitHub, providing instant context for new hires"
                  version="three"
                />
                <WhyChooseUsCard
                  caretright4Color="white"
                  className="why-choose-us-card-7"
                  icon={<Chartbar className="instance-node-5" color="white" />}
                  iconContainerClassName="why-choose-us-card-2"
                  text6="Traceable Impact Analysis"
                  text7="See exactly what changed and why. Track the technical impact of every code change with source-linked documentation that shows how PRs and tickets affect your architecture, services, and runbooks"
                  textClassName="instance-node-6"
                  version="four"
                />
              </div>
            </div>
          </div>

          {/* Works with the tools section */}
          <div className="tools-section">
            <div className="tools-section-header">
              <div className="text-37">
                Works with the tools
                <br />
                you already use
                </div>
              <p className="text-25">
                Sync your stack in minutes, turn PRs, tickets, and threads into living docs.
              </p>
              </div>

            <div className="tools-grid">
              <ToolCard
                logo={
                  <img
                    src="https://cdn.simpleicons.org/asana/F06A6A"
                    alt="Asana"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Asana"
                category="Project Management"
              />
              <ToolCard
                logo={
                  <img
                    src="/img/image-588254642.png"
                    alt="Zoom"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Zoom"
                category="Video Conferencing"
              />
              <ToolCard
                logo={<Slack className="slack-tool-icon" />}
                toolName="Slack"
                category="Collaboration Platform"
              />
              <ToolCard
                logo={<SocialIcons1 className="github-tool-icon" />}
                toolName="GitHub"
                category="Development Platform"
              />
              <ToolCard
                logo={<JiraCore2 className="jira-tool-icon" />}
                toolName="Jira"
                category="Work Management Platform"
              />
              <ToolCard
                logo={<Notion1 className="notion-tool-icon" />}
                toolName="Notion"
                category="Note-taking App"
              />
              <ToolCard
                logo={
                  <img
                  src="/img/Google_Drive_logo.png"
                    alt="Google Drive"
                    style={{ height: "36px", width: "auto" }}
                  />
                }
                toolName="Google Drive"
                category="Cloud storage and File Sharing"
              />
              <ToolCard
                logo={
                  <img
                    src="/img/microsfot_team_logo.png"
                      alt="Microsoft Teams"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Microsoft Teams"
                category="Collaboration Platform"
                  />
                </div>
              </div>

          {/* Blog / Resources Section */}
          <div id="blog-section" className="blog-section">
            <div className="blog-section-header">
              <div className="text-37">
                From the blog
                </div>
              <p className="text-25">
                Practical guides on documentation, developer workflows, and AI that fits into real teams.
              </p>
              </div>

            <div className="blog-grid">
              <BlogCard
                imageUrl="/img/coding.png"
                title="Keeping docs up to date as code changes"
                description="Stop your technical docs from falling behind. Learn an automated developer workflow using GitHub PRs and Jira tickets to keep internal documentation current. Improve developer onboarding and ensure technical decisions are never lost"
                meta="5 min read"
              />
              <BlogCard
                imageUrl="/img/collaboration_teams-vs.png"
                title="Answers you can trust, with links to the source"
                description="Summaries are only useful if you can verify them. Learn how to turn threads, tickets, and PR discussions into source-linked answers that your team can check, share, and rely on without second guessing."
                meta="6 min read"
              />
              <BlogCard
                imageUrl="/img/feature.png"
                title="A practical setup for living documentation"
                description="Living docs are not about writing more, they are about staying aligned as things change. This guide covers the patterns teams use to keep specs, runbooks, and architecture notes accurate, even when priorities shift mid-sprint."
                meta="7 min read"
              />
              </div>
            </div>

          {/* New Testimonials Section */}
          <div className="testimonials-section">
            <div className="testimonials-section-header">
              <div className="text-37 testimonials-header-text">
                What users
                <br />
                <span className="testimonials-header-gray">Say about ScopeDocs</span>
                </div>
              <p className="text-25">
                Our users success stories highlight the real value.
              </p>
              </div>

            <div className="testimonials-grid">
              <NewTestimonialCard
                quote="I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what's going to happen…because this has been really difficult for us to get LLMs to [document] this well."
                name="Sarah T"
                title="COO"
                avatar="/img/avatar-1.png"
              />
              <NewTestimonialCard
                quote="I've paid for a lot of project management tools, but what caught my attention was that your product was generative documentation!"
                name="David K"
                title="Software Development Engineer"
                avatar="/img/avatar-2.png"
              />
              <NewTestimonialCard
                quote="We finally have documentation that stays current. When tickets and PRs change, ScopeDocs keeps the docs aligned with reality."
                name="Alexa R."
                title="VP of Engineering"
                avatar="/img/avatar-3.png"
                logo={
                  <img
                    src="/img/Google_Drive_logo.png"
                    alt="Google Drive"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                    />
                  </div>
                </div>

        </>
      )}

      {screenWidth >= 1440 && (
        <>
          <div className="container-7">
            <div className="hero-3">
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
                      <img 
                        className="character-capital-logo" 
                        alt="Character Capital" 
                        src="/img/character_capital_logo.png" 
                      />

                      <div className="text-10">Backed by Character Capital</div>
                    </button>

                    <div className="content-29">
                      <div className="text-38">
                        Stop Writing Docs
                        <br />
                        Start Automating Them
                      </div>

                      <p className="text-39">
                        <span className="span">ScopeDocs is an AI documentation platform that turns your GitHub, Slack, and Jira activity into a single source of truth automatically</span>
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

            {/* Header Coding Image Block */}
            <div className="header-coding-image-section">
              <div className="header-coding-image-container">
                <img
                  src="/img/header_coding_image.png"
                  alt="Coding and Documentation"
                  className="header-coding-image"
                  loading="lazy"
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
                  text="Automated Documentation"
                  text1="Connect Slack, GitHub PRs, and Jira tickets to eliminate manual wiki updates. ScopeDocs syncs with your code changes in real-time to create a single source of truth for your engineering team, ensuring no detail is lost as you ship"
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
                  text2="Flexible Engineering Workflows"
                  text3="Scale with your existing services and org structure without disrupting developer velocity. ScopeDocs integrates directly into your SDLC and documentation workflows, capturing real-time team activity instead of relying on manual templates"
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
                  text4="Automated Developer Onboarding"
                  text5="Build a traceable knowledge base with clean onboarding pages and technical handoffs. Every page is automatically generated with direct links back to the original source threads in Slack or GitHub, providing instant context for new hires"
                  version="three"
                />
                <WhyChooseUsCard
                  caretright4Color="white"
                  className="why-choose-us-card-8"
                  icon={<Chartbar className="instance-node-5" color="white" />}
                  iconContainerClassName="why-choose-us-card-2"
                  text6="Traceable Impact Analysis"
                  text7="See exactly what changed and why. Track the technical impact of every code change with source-linked documentation that shows how PRs and tickets affect your architecture, services, and runbooks"
                  textClassName="instance-node-6"
                  version="four"
                />
              </div>
            </div>
          </div>

          {/* Works with the tools section */}
          <div className="tools-section">
            <div className="tools-section-header">
              <div className="text-37">
                Works with the tools
                <br />
                you already use
                </div>
              <p className="text-25">
                Sync your stack in minutes, turn PRs, tickets, and threads into living docs.
              </p>
              </div>

            <div className="tools-grid">
              <ToolCard
                logo={
                  <img
                    src="https://cdn.simpleicons.org/asana/F06A6A"
                    alt="Asana"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Asana"
                category="Project Management"
              />
              <ToolCard
                logo={
                  <img
                    src="/img/image-588254642.png"
                    alt="Zoom"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Zoom"
                category="Video Conferencing"
              />
              <ToolCard
                logo={<Slack className="slack-tool-icon" />}
                toolName="Slack"
                category="Collaboration Platform"
              />
              <ToolCard
                logo={<SocialIcons1 className="github-tool-icon" />}
                toolName="GitHub"
                category="Development Platform"
              />
              <ToolCard
                logo={<JiraCore2 className="jira-tool-icon" />}
                toolName="Jira"
                category="Work Management Platform"
              />
              <ToolCard
                logo={<Notion1 className="notion-tool-icon" />}
                toolName="Notion"
                category="Note-taking App"
              />
              <ToolCard
                logo={
                  <img
                  src="/img/Google_Drive_logo.png"
                    alt="Google Drive"
                    style={{ height: "36px", width: "auto" }}
                  />
                }
                toolName="Google Drive"
                category="Cloud storage and File Sharing"
              />
              <ToolCard
                logo={
                  <img
                      src="/img/microsfot_team_logo.png"
                    alt="Microsoft Teams"
                    style={{ height: "40px", width: "auto" }}
                  />
                }
                toolName="Microsoft Teams"
                category="Collaboration Platform"
                    />
                  </div>
                </div>

          {/* Blog / Resources Section */}
          <div id="blog-section" className="blog-section">
            <div className="blog-section-header">
              <div className="text-37">
                From the blog
              </div>
              <p className="text-25">
                Practical guides on documentation, developer workflows, and AI that fits into real teams.
              </p>
            </div>

            <div className="blog-grid">
              <BlogCard
                imageUrl="/img/coding.png"
                title="Keeping docs up to date as code changes"
                description="Stop your technical docs from falling behind. Learn an automated developer workflow using GitHub PRs and Jira tickets to keep internal documentation current. Improve developer onboarding and ensure technical decisions are never lost"
                meta="5 min read"
              />
              <BlogCard
                imageUrl="/img/collaboration_teams-vs.png"
                title="Answers you can trust, with links to the source"
                description="Summaries are only useful if you can verify them. Learn how to turn threads, tickets, and PR discussions into source-linked answers that your team can check, share, and rely on without second guessing."
                meta="6 min read"
              />
              <BlogCard
                imageUrl="/img/feature.png"
                title="A practical setup for living documentation"
                description="Living docs are not about writing more, they are about staying aligned as things change. This guide covers the patterns teams use to keep specs, runbooks, and architecture notes accurate, even when priorities shift mid-sprint."
                meta="7 min read"
              />
              </div>
            </div>

          {/* New Testimonials Section */}
          <div className="testimonials-section">
            <div className="testimonials-section-header">
              <div className="text-37 testimonials-header-text">
                What users
                <br />
                <span className="testimonials-header-gray">Say about ScopeDocs</span>
                      </div>
              <p className="text-25">
                Our users success stories highlight the real value.
                        </p>
                      </div>

            <div className="testimonials-grid">
              <NewTestimonialCard
                quote="I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what's going to happen…because this has been really difficult for us to get LLMs to [document] this well."
                name="Sarah T"
                title="COO"
                avatar="/img/avatar-1.png"
              />
              <NewTestimonialCard
                quote="I've paid for a lot of project management tools, but what caught my attention was that your product was generative documentation!"
                name="David K"
                title="Software Development Engineer"
                avatar="/img/avatar-2.png"
              />
              <NewTestimonialCard
                quote="We finally have documentation that stays current. When tickets and PRs change, ScopeDocs keeps the docs aligned with reality."
                name="Alexa R."
                title="VP of Engineering"
                avatar="/img/avatar-3.png"
              />
              </div>
            </div>

        </>
      )}


      {screenWidth >= 1440 && (
        <>
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
            <div className="faq-grid-container">
              <div className="faq-left-column">
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
            </div>

              <div className="faq-right-column">
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
                text="&#34;I love the idea of all these systems being monitored, brought together, and getting a cohesive idea of what's going to happen…because this has been really difficult for us to get LLMs to [document] this well.&#34;"
                text1="Sarah T"
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
            <div className="faq-grid-container">
              <div className="faq-left-column">
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
            </div>

              <div className="faq-right-column">
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
