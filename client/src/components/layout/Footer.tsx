import { Link } from "wouter";
import { BriefcaseIcon, FacebookIcon, TwitterIcon, LinkedinIcon, InstagramIcon, ExternalLinkIcon, Globe2Icon, CopyrightIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Footer = () => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  return (
    <footer className="bg-white border-t border-neutral-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-[#0A77FF] text-2xl">
                <BriefcaseIcon />
              </div>
              <span className="font-bold text-xl text-[#0A77FF]">StageConnect</span>
            </div>
            <p className="text-sm text-neutral-600 mb-6 max-w-xs">
              Connecting talented students with premier internship opportunities to launch successful careers.
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-[#0A77FF]/10 hover:text-[#0A77FF] transition-colors duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-[#0A77FF]/10 hover:text-[#0A77FF] transition-colors duration-200"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-[#0A77FF]/10 hover:text-[#0A77FF] transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-[#0A77FF]/10 hover:text-[#0A77FF] transition-colors duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">For Students</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/internships" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Browse Internships
                </Link>
              </li>
              <li>
                <Link href="/cv-builder" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  CV Builder
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline flex items-center">
                  Career Resources
                  <ExternalLinkIcon className="h-3 w-3 ml-1 inline" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Learning Center
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">For Companies</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/employer-dashboard" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                   Company Dashboard
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Post Internships
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Talent Search
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Company Profiles
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Employer Resources
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">StageConnect</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[#0A77FF] hover:underline">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Secondary footer */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <CopyrightIcon className="h-3.5 w-3.5 text-neutral-500 mr-1" />
            <p className="text-sm text-neutral-500">
              {new Date().getFullYear()} StageConnect Corporation. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-neutral-500 flex items-center text-xs"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                <Globe2Icon className="h-3.5 w-3.5 mr-1.5" />
                English (US)
                <ChevronUpIcon className={`h-3.5 w-3.5 ml-1.5 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} />
              </Button>
              
              {showLanguageSelector && (
                <div className="absolute bottom-full mb-2 right-0 bg-white border border-neutral-200 rounded-md shadow-md p-2 w-48">
                  <ul className="space-y-1.5">
                    <li className="px-2 py-1 text-xs text-[#0A77FF] bg-[#0A77FF]/5 rounded">English (US)</li>
                    <li className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer">Français</li>
                    <li className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer">Español</li>
                    <li className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer">Deutsch</li>
                    <li className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer">Italiano</li>
                    <li className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer">العربية</li>
                  </ul>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-500 hover:text-[#0A77FF] text-xs"
            >
              Accessibility
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-500 hover:text-[#0A77FF] text-xs"
            >
              Cookie Policy
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
