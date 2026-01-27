import { useState } from "react";
import { Button } from "../Button";
import { Logo } from "../Logo";
import "./style.css";

export const Navbar = ({
  className,
  logoFill = "/img/fill-3-1.svg",
  logoImg = "/img/fill-2-3.svg",
  logoFill1 = "/img/fill-1-1.svg",
  hasMenu = true,
  menuClassName,
  buttonSizeNormalTypeClassName,
  buttonText = "Try Beta Version",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToFeatures = () => {
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
    setIsMenuOpen(false);
  };

  const scrollToBlog = () => {
    const element = document.getElementById('blog-section');
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleMenuClick = (callback) => {
    if (callback) callback();
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={`navbar ${className}`}>
        <div className="logo-wrapper">
          <Logo
            className="logo-2"
            fill={logoFill1}
            fill1={logoImg}
            img={logoFill}
            state="white"
          />
        </div>

        <div className="nav-link">
          <div className="menu">
            <div className="text-9">About</div>
          </div>

          <div className="menu" onClick={scrollToFeatures}>
            <div className="text-9">Features</div>
          </div>

          <div className="menu" onClick={scrollToBlog}>
            <div className="text-9">Blog</div>
          </div>

          <div className={`div-wrapper ${menuClassName}`}>
            <div className="text-9">Pricing</div>
          </div>

          <a href="mailto:hello@scopedocs.ai?subject=ScopeDocs%20Inquiry" className="menu">
            <div className="text-9">Contact Us</div>
          </a>
        </div>

        <Button
          className={buttonSizeNormalTypeClassName}
          size="normal"
          text={buttonText}
          textClassName="button-instance"
          type="secondary"
          href={buttonText === "Book Demo" ? "https://calendar.google.com/appointments/schedules/AcZssZ1yqI_HhQODo1FeOZ4yBo2_fl9FnbYOLEaLdd_yM3t7vIht4BJSZm5S2mXQqEf8P3bey9TlQ7KD" : undefined}
        />

        {/* Hamburger button for mobile */}
        <button 
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`mobile-menu-overlay ${isMenuOpen ? 'mobile-menu-overlay-open' : ''}`}
        onClick={toggleMenu}
      ></div>
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
        <button 
          className="mobile-menu-close"
          onClick={toggleMenu}
          aria-label="Close menu"
        >
          ×
        </button>
        <div className="mobile-menu-content">
          <div className="mobile-menu-item" onClick={() => handleMenuClick()}>
            <div className="text-9">About</div>
          </div>

          <div className="mobile-menu-item" onClick={() => handleMenuClick(scrollToFeatures)}>
            <div className="text-9">Features</div>
          </div>

          <div className="mobile-menu-item" onClick={() => handleMenuClick(scrollToBlog)}>
            <div className="text-9">Blog</div>
          </div>

          <a 
            href="mailto:hello@scopedocs.ai?subject=ScopeDocs%20Inquiry" 
            className="mobile-menu-item"
            onClick={() => handleMenuClick()}
          >
            <div className="text-9">Contact Us</div>
          </a>

          <div className="mobile-menu-button">
            <Button
              className={buttonSizeNormalTypeClassName}
              size="normal"
              text={buttonText}
              textClassName="button-instance"
              type="secondary"
              href={buttonText === "Book Demo" ? "https://calendar.google.com/appointments/schedules/AcZssZ1yqI_HhQODo1FeOZ4yBo2_fl9FnbYOLEaLdd_yM3t7vIht4BJSZm5S2mXQqEf8P3bey9TlQ7KD" : undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
};
