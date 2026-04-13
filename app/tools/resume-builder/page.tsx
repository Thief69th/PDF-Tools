'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  ArrowRight, 
  Loader2, 
  Plus,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export default function ResumeBuilderPage() {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: ''
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Math.random().toString(36).substring(7),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Math.random().toString(36).substring(7),
      school: '',
      degree: '',
      year: ''
    }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const downloadPdf = async () => {
    if (!resumeRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${personalInfo.fullName || 'Resume'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="text-black dark:text-white">Resume Builder</span>
        </nav>

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-black dark:text-white">Resume Builder</h1>
            <p className="mt-2 text-black dark:text-white opacity-70">
              Create a professional resume and download it as a PDF.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'edit' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-white hover:text-black dark:text-white'
              }`}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'preview' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-white hover:text-black dark:text-white'
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className={`space-y-8 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            {/* Personal Info */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:border-indigo-600 outline-none text-black dark:text-white"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:border-indigo-600 outline-none text-black dark:text-white"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:border-indigo-600 outline-none text-black dark:text-white"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location (City, Country)"
                  value={personalInfo.location}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:border-indigo-600 outline-none text-black dark:text-white"
                />
              </div>
              <textarea
                name="summary"
                placeholder="Professional Summary"
                value={personalInfo.summary}
                onChange={handlePersonalInfoChange}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:border-indigo-600 outline-none min-h-[100px] text-black dark:text-white"
              />
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                <h2 className="text-xl font-bold text-black dark:text-white">Experience</h2>
                <button onClick={addExperience} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-bold">
                  <Plus size={16} /> Add
                </button>
              </div>
              
              <AnimatePresence>
                {experiences.map((exp) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-4 border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 font-bold outline-none text-black dark:text-white"
                      />
                      <button onClick={() => removeExperience(exp.id)} className="ml-2 text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 outline-none text-black dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start Date (e.g. Jan 2020)"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-sm outline-none text-black dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="End Date (e.g. Present)"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-sm outline-none text-black dark:text-white"
                      />
                    </div>
                    <textarea
                      placeholder="Job Description"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-sm outline-none min-h-[80px] text-black dark:text-white"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                <h2 className="text-xl font-bold text-black dark:text-white">Education</h2>
                <button onClick={addEducation} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-bold">
                  <Plus size={16} /> Add
                </button>
              </div>
              
              <AnimatePresence>
                {education.map((edu) => (
                  <motion.div key={edu.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-4 border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        placeholder="Degree / Certificate"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 font-bold outline-none text-black dark:text-white"
                      />
                      <button onClick={() => removeEducation(edu.id)} className="ml-2 text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="School / University"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 outline-none text-black dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g. 2018 - 2022)"
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-sm outline-none text-black dark:text-white"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Skills</h2>
              <textarea
                placeholder="List your skills separated by commas (e.g. JavaScript, React, Node.js)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:border-indigo-600 outline-none min-h-[100px] text-black dark:text-white"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className={`lg:block ${activeTab === 'edit' ? 'hidden' : 'block'}`}>
            <div className="sticky top-24 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={downloadPdf}
                  disabled={isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download PDF
                </button>
              </div>

              <div className="overflow-x-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200">
                <div 
                  ref={resumeRef}
                  className="bg-white dark:bg-gray-800 mx-auto shadow-xl"
                  style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
                >
                  {/* Resume Content */}
                  <div className="border-b-2 border-gray-800 pb-6 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      {personalInfo.fullName || 'YOUR NAME'}
                    </h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-white">
                      {personalInfo.email && <span>{personalInfo.email}</span>}
                      {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                      {personalInfo.location && <span>• {personalInfo.location}</span>}
                    </div>
                  </div>

                  {personalInfo.summary && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-700 dark:text-white leading-relaxed">
                        {personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {experiences.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                        Experience
                      </h2>
                      <div className="space-y-4">
                        {experiences.map(exp => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">{exp.position || 'Position'}</h3>
                              <span className="text-xs font-medium text-gray-500 dark:text-white">
                                {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-indigo-600 mb-2">
                              {exp.company || 'Company Name'}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                        Education
                      </h2>
                      <div className="space-y-4">
                        {education.map(edu => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">{edu.degree || 'Degree'}</h3>
                              <span className="text-xs font-medium text-gray-500 dark:text-white">{edu.year}</span>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-white">
                              {edu.school || 'School Name'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {skills && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.split(',').map((skill, index) => (
                          <span key={index} className="text-sm text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
