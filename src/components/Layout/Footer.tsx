import React from "react";
import { FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";

const Footer: React.FC = () => {
    return (
        <footer className="bg-background border-t py-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-muted-foreground text-center md:text-left font-medium">
                    © {new Date().getFullYear()} Bibek Kumar Kushwaha
                </div>
                <div className="flex gap-6">
                    <a
                        href="https://github.com/Bibek-Kumar-Kushwaha"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                        aria-label="GitHub"
                    >
                        <FaGithub className="w-6 h-6" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/bibek-kumar-kushwaha-993942280/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#0A66C2] transition-colors"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a
                        href="https://www.facebook.com/bibek.kushwaha.01"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#1877F3] transition-colors"
                        aria-label="Facebook"
                    >
                        <FaFacebook className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;