import { Link } from "wouter";
import { BriefcaseIcon, FacebookIcon, TwitterIcon, LinkedinIcon, InstagramIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-primary-600 text-2xl">
                <BriefcaseIcon />
              </div>
              <span className="font-bold text-xl text-primary-700">StageConnect</span>
            </div>
            <p className="text-sm text-neutral-500 mb-4">Connecting students with their ideal internship opportunities.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-600">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600">
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">For Students</h3>
            <ul className="space-y-2">
              <li><Link href="/internships" className="text-sm text-neutral-500 hover:text-primary-600">Find Internships</Link></li>
              <li><Link href="/cv-builder" className="text-sm text-neutral-500 hover:text-primary-600">CV Builder</Link></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Career Resources</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Student Success Stories</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">For Companies</h3>
            <ul className="space-y-2">
              <li><Link href="/employer-dashboard" className="text-sm text-neutral-500 hover:text-primary-600">Employer Dashboard</Link></li>
              <li><Link href="/employer-dashboard" className="text-sm text-neutral-500 hover:text-primary-600">Post Internships</Link></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Find Talent</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Company Profiles</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Help Center</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} StageConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
