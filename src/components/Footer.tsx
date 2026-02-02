import React from "react";
import { Link } from "react-router-dom";
import Facebook from "@/assets/social-media/facebook.svg";
import Twitter from "@/assets/social-media/twitter.svg";
import Linkedin from "@/assets/social-media/linkedIn.svg";
import Instagram from "@/assets/social-media/instagram.svg";
import LogoFullWhite from "@/assets/logo-full-white.svg";
import LogoWhite from "@/assets/logo-white.svg";
import FooterBg from "@/assets/footerbg.webp";
import AppleStore from "./AppleStore";
import GooglePlay from "./GooglePlay";
import AwsSsl from "@/assets/aws-ssl.webp";
import { HeartIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";

interface FooterProps {
  type?: "styled" | "basic";
}

const footerLinks = [
  {
    title: "Product",
    links: [
      {
        name: "Features",
        path: "/features",
      },
      // {
      //     name: "Pricing",
      //     path: "/pricing"
      // },
      {
        name: "Integrations",
        path: "/integrations",
      },
      {
        name: "Security",
        path: "/security-and-compilance",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        name: "About Us",
        path: "/about-us",
      },
      {
        name: "Careers",
        path: "/careers",
      },
      {
        name: "Contact Us",
        path: "/contact-us",
      },
      // {
      //     name: "Blog",
      //     path: "/blog"
      // },
    ],
  },
  {
    title: "Resources",
    links: [
      // {
      //     name: "Tutorials",
      //     path: "/tutorials"
      // },
      {
        name: "FAQs",
        path: "/faq",
      },
    ],
  },
];

const Footer: React.FC<FooterProps> = ({ type = "basic" }) => {
  const path = useLocation().pathname;
  const { user: appUser } = useAppSelector((state) => state.auth);

  const styledPaths = [
    "/integrations",
    "/about-us",
    "/faq",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-policy",
    "/security-and-compilance",
    "/features",
    "/careers",
    "/contact-us",
  ];
  if (styledPaths.includes(path)) {
    type = "styled";
  }

  const currentYear = new Date().getFullYear();

  // Removed subscribe functionality

  return type === "basic" ? (
    <footer className="flex flex-col gap-3 md:flex-row md:items-center justify-between p-3">
      <img
        width={80}
        height={25}
        src={LogoFullWhite}
        className="invert hidden dark:invert-0 md:block"
        alt="logo"
      />

      <div className="md:hidden flex justify-between">
        <img
          width={80}
          height={25}
          src={LogoFullWhite}
          className="invert dark:invert-0"
          alt="logo"
        />
        <div className="flex items-center gap-4 dark:invert">
          <Link target="_blank" to="https://www.facebook.com/thekloutclub">
            <img src={Facebook} alt="facebook" />
          </Link>
          <Link to="https://twitter.com/thekloutclub">
            <img src={Twitter} alt="twitter" />
          </Link>
          <Link to="https://www.linkedin.com/company/klout-club">
            <img src={Linkedin} alt="linkedin" />
          </Link>
          <Link to="https://www.instagram.com/klout_club">
            <img src={Instagram} alt="instagram" />
          </Link>
        </div>
      </div>

      <div className="">
        <p className="text-xs text-brand mb-2 md:mb-0">
          Copyright &copy; {currentYear} -{" "}
          {(currentYear + 1).toString().slice(2)} Zirclez Innovation. All rights
          reserved | The Klout Club is made with{" "}
          <span className="text-base">&#9825;</span>
        </p>
        <p className="flex gap-x-5 gap-y-2 md:gap-2 items-center md:justify-center flex-wrap md:flex-nowrap text-xs text-brand">
          <Link to="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          <span className="text-brand lg:block hidden">|</span>
          <Link to="/terms-and-conditions" className="underline">
            Terms and Conditions
          </Link>
          <span className="text-brand lg:block hidden">|</span>
          <Link to="/refund-policy" className="underline">
            Refund Policy
          </Link>
          <span className="text-brand lg:block hidden">|</span>
          <Link to="/faq" className="underline">
            FAQ
          </Link>
          <span className="text-brand lg:block hidden">|</span>
          <Link to="/contact-us" className="underline">
            Contact Us
          </Link>
        </p>
      </div>

      <div className="hidden md:flex dark:invert items-center gap-4">
        <Link target="_blank" to="https://www.facebook.com/thekloutclub">
          <img src={Facebook} alt="facebook" />
        </Link>
        <Link to="https://twitter.com/thekloutclub">
          <img src={Twitter} alt="twitter" />
        </Link>
        <Link to="https://www.linkedin.com/company/klout-club">
          <img src={Linkedin} alt="linkedin" />
        </Link>
        <Link to="https://www.instagram.com/klout_club">
          <img src={Instagram} alt="instagram" />
        </Link>
      </div>
    </footer>
  ) : (
    <footer
      className="w-full"
      style={{
        backgroundImage: `url(${FooterBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto p-5 py-10 flex flex-col lg:flex-row gap-10 lg:gap-40">
        {/* Left Section */}
        <div className="flex flex-col items-center lg:items-start gap-6 lg:gap-[60px] w-full lg:w-1/2">
          {/* Logo */}
          {appUser && (
            <div className="w-full flex justify-end">
              <Link to="/">
                <img
                  src={LogoWhite}
                  width={152}
                  height={69}
                  alt="logo"
                  className="w-[140px] sm:w-[160px] lg:w-[200px] h-auto"
                />
              </Link>
            </div>
          )}
          <Link to="/dashboard">
            <img
              src={LogoWhite}
              width={152}
              height={69}
              alt="logo"
              className="w-[140px] sm:w-[160px] lg:w-[200px] h-auto"
            />
          </Link>
          {/* Store Buttons */}
          <div className="flex items-center justify-center lg:justify-start gap-4 invert dark:invert-0 flex-wrap">
            <AppleStore />
            <GooglePlay />
          </div>

          {/* AWS SSL Badge */}
          <img
            width={150}
            height={150}
            src={AwsSsl}
            alt="AWS SSL"
            className="w-[150px] sm:w-[180px] lg:w-[220px] mt-2"
          />
        </div>

        {/* Right Section */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-8 text-brand-light-gray">
          {footerLinks.map((item, index) => (
            <div key={index}>
              <h5 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-8">
                {item.title}
              </h5>
              <ul>
                {item.links.map((link, linkIndex) => (
                  <li
                    key={linkIndex}
                    className="text-white text-sm lg:text-base my-2"
                  >
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 text-white p-5 border-t border-white/20">
        {/* Logo */}
        <img
          width={80}
          height={25}
          src={LogoFullWhite}
          alt="logo"
          className="order-1 lg:order-none"
        />

        {/* Copyright + Links */}
        <div className="order-3 lg:order-none text-center lg:text-left">
          <p className="flex flex-wrap justify-center lg:justify-start gap-1 items-center text-xs text-brand mb-1">
            Copyright &copy; {currentYear} -{" "}
            {(currentYear + 1).toString().slice(2)} Zirclez Innovation. All
            rights reserved | The Klout Club is made with{" "}
            <HeartIcon className="w-4 h-4 stroke-1" />
          </p>
          <p className="flex flex-wrap justify-center lg:justify-start gap-2 text-xs text-brand">
            <Link to="/privacy-policy" className="underline">
              Privacy Policy
            </Link>
            <span className="hidden sm:block">|</span>
            <Link to="/terms-and-conditions" className="underline">
              Terms and Conditions
            </Link>
            <span className="hidden sm:block">|</span>
            <Link to="/refund-policy" className="underline">
              Refund Policy
            </Link>
            <span className="hidden sm:block">|</span>
            <Link to="/faq" className="underline">
              FAQ
            </Link>
            <span className="hidden sm:block">|</span>
            <Link to="/contact-us" className="underline">
              Contact Us
            </Link>
          </p>
        </div>

        {/* Social Icons */}
        <div className="order-2 lg:order-none flex items-center justify-center gap-4 invert">
          <Link to="https://www.facebook.com/thekloutclub">
            <img src={Facebook} alt="facebook" />
          </Link>
          <Link to="https://twitter.com/thekloutclub">
            <img src={Twitter} alt="twitter" />
          </Link>
          <Link to="https://www.linkedin.com/company/klout-club">
            <img src={Linkedin} alt="linkedin" />
          </Link>
          <Link to="https://www.instagram.com/klout_club">
            <img src={Instagram} alt="instagram" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
