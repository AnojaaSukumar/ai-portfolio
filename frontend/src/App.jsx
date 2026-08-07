import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  PlusCircle, FolderGit2, User, Code2, Trash2, Bot, Send, 
  Award, FileText, ExternalLink, Eye, Pencil, X, Lock, Key, 
  ArrowRight, Camera, ShieldCheck, GraduationCap 
} from 'lucide-react';
// Base URL configuration for local dev and live production
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
export default function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Security State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const photoInputRef = useRef(null);
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I am Anojaa's AI Assistant. Ask me anything about her featured projects, university coursework, or certificates!" }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Form States (Add)
  const [newProject, setNewProject] = useState({ title: '', type: '', description: '', tech_stack: '', github_link: '' });
  const [newAcademicProject, setNewAcademicProject] = useState({ title: '', type: '', description: '', tech_stack: '', github_link: '' });
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certFile, setCertFile] = useState(null);

  // Edit State
  const [editingProject, setEditingProject] = useState(null);
  const [editingAcademicProject, setEditingAcademicProject] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [editCertFile, setEditCertFile] = useState(null);

  // Modal Image Preview State
  const [activePreview, setActivePreview] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/portfolio`);
      const data = response.data;

      // Safe fallbacks to prevent white screen crashes
      data.projects = data.projects || [];
      data.academic_projects = data.academic_projects || [];
      data.certificates = data.certificates || [];
      data.skills = data.skills || [];

      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAdminUnlock = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/admin/verify`, { password: adminPassword });
      setIsAdminUnlocked(true);
      setShowAdminModal(false);
      setAdminPassword('');
    } catch (error) {
      alert('Incorrect Admin Password!');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) return;
    try {
    await axios.put(`${API_BASE_URL}/api/admin/password`, { new_password: newPasswordInput });
      alert('Admin password updated successfully!');
      setNewPasswordInput('');
    } catch (error) {
      alert('Failed to update password.');
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      alert('Please select an image file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', photoFile);

    try {
      await axios.post(`${API_BASE_URL}/api/profile/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile photo updated successfully!');
      setPhotoFile(null);
      fetchPortfolio();
    } catch (error) {
      alert('Failed to upload photo.');
    }
  };

  const renderMessageContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const cleanUrl = part.replace(/ /g, '%20');
        return (
          <a
            key={index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#38BDF8', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!inputMsg.trim()) return;

  const userText = inputMsg;
  setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
  setInputMsg('');

  try {
    const res = await axios.post(`${API_BASE_URL}/api/chat`, { message: userText });
    
    // 💡 Add this line to log the backend reply in the browser console (F12)
    console.log("Backend response:", res.data);

    setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
  } catch (err) {
    console.error("Axios Error:", err);
    setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I couldn\'t process that right now.' }]);
  }
};

  // ADD FEATURED PROJECT
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const formattedProject = {
        ...newProject,
        tech_stack: newProject.tech_stack.split(',').map((item) => item.trim())
      };
      await axios.post(`${API_BASE_URL}/api/projects`, formattedProject);
      alert('Featured project added!');
      setNewProject({ title: '', type: '', description: '', tech_stack: '', github_link: '' });
      fetchPortfolio();
    } catch (error) {
      alert('Failed to add project.');
    }
  };

  // ADD ACADEMIC PROJECT
  const handleAddAcademicProject = async (e) => {
    e.preventDefault();
    try {
      const formattedProject = {
        ...newAcademicProject,
        tech_stack: newAcademicProject.tech_stack.split(',').map((item) => item.trim())
      };
      await axios.post(`${API_BASE_URL}/api/academic-projects`, formattedProject);
      alert('University project added!');
      setNewAcademicProject({ title: '', type: '', description: '', tech_stack: '', github_link: '' });
      fetchPortfolio();
    } catch (error) {
      alert('Failed to add academic project.');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const formatted = {
        ...editingProject,
        tech_stack: typeof editingProject.tech_stack === 'string' 
          ? editingProject.tech_stack.split(',').map((item) => item.trim()) 
          : editingProject.tech_stack
      };
      await axios.put(`${API_BASE_URL}/api/projects/${editingProject.id}`, formatted);
      alert('Project updated!');
      setEditingProject(null);
      fetchPortfolio();
    } catch (error) {
      alert('Failed to update project.');
    }
  };

  const handleUpdateAcademicProject = async (e) => {
    e.preventDefault();
    try {
      const formatted = {
        ...editingAcademicProject,
        tech_stack: typeof editingAcademicProject.tech_stack === 'string' 
          ? editingAcademicProject.tech_stack.split(',').map((item) => item.trim()) 
          : editingAcademicProject.tech_stack
      };
      await axios.put(`${API_BASE_URL}/api/academic-projects/${editingAcademicProject.id}`, formatted);
      alert('University project updated!');
      setEditingAcademicProject(null);
      fetchPortfolio();
    } catch (error) {
      alert('Failed to update university project.');
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/projects/${id}`);
        fetchPortfolio();
      } catch (error) {
        alert('Failed to delete project.');
      }
    }
  };

  const handleDeleteAcademicProject = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/academic-projects/${id}`);
        fetchPortfolio();
      } catch (error) {
        alert('Failed to delete university project.');
      }
    }
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim() || !certDate || !certFile) {
      alert('Please fill out all certificate fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', certTitle);
    formData.append('issuer', certIssuer);
    formData.append('issue_date', certDate);
    formData.append('file', certFile);

    try {
      await axios.post(`${API_BASE_URL}/api/certificates/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Certificate uploaded successfully!');
      setCertTitle('');
      setCertIssuer('');
      setCertDate('');
      setCertFile(null);
      fetchPortfolio();
    } catch (error) {
      alert('Failed to upload certificate.');
    }
  };

  const handleUpdateCertificate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editingCert.title);
    formData.append('issuer', editingCert.issuer);
    formData.append('issue_date', editingCert.issue_date);
    if (editCertFile) {
      formData.append('file', editCertFile);
    }

    try {
      await axios.put(`${API_BASE_URL}/api/certificates/${editingCert.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Certificate updated successfully!');
      setEditingCert(null);
      setEditCertFile(null);
      fetchPortfolio();
    } catch (error) {
      alert('Failed to update certificate.');
    }
  };

  const handleDeleteCertificate = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/certificates/${id}`);
        fetchPortfolio();
      } catch (error) {
        alert('Failed to delete certificate.');
      }
    }
  };

  const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', backgroundColor: '#0F172A', color: '#F8FAFC', minHeight: '100vh' }}>
        <h2>Loading Living AI Portfolio...</h2>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* 🟢 TOP DARK NAV BAR */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <span style={styles.logoBadge}>A</span> Anojaa Sukumar.
        </div>
        <div style={styles.navLinks}>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#skills" style={styles.navLink}>Specializations</a>
          <a href="#projects" style={styles.navLink}>Featured Work</a>
          <a href="#academic" style={styles.navLink}>University Projects</a>
          <a href="#certificates" style={styles.navLink}>Certifications</a>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {!isAdminUnlocked ? (
            <button style={styles.adminLoginBtn} onClick={() => setShowAdminModal(true)}>
              <Lock size={14} /> Admin
            </button>
          ) : (
            <button style={styles.adminUnlockedBtn} onClick={() => setIsAdminUnlocked(false)}>
              🔒 Lock Admin
            </button>
          )}
          <button onClick={() => setChatOpen(true)} style={styles.contactBtn}>
            AI Recruiter
          </button>
        </div>
      </nav>

      {/* 🌟 HERO BANNER SECTION */}
      <header style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.greetingPill}>👋 Welcome to my Portfolio</div>
          <h1 style={styles.heroTitle}>
            I'm <span style={{ color: '#0284C7' }}>Anojaa Sukumar</span>,<br />
            {portfolio?.personal_info?.role || 'AI Specialist & Software Developer'}
          </h1>
          <p style={styles.heroSubtext}>{portfolio?.personal_info?.about}</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <a href="#projects" style={styles.primaryBtn}>
              Explore Projects <ArrowRight size={16} />
            </a>
            <button style={styles.secondaryBtn} onClick={() => setChatOpen(true)}>
              Talk with AI Assistant
            </button>
          </div>
        </div>

        <div style={styles.heroPhotoWrapper}>
          <div style={styles.photoContainer}>
            {portfolio?.personal_info?.profile_photo ? (
            <img 
  src={
    portfolio.personal_info.profile_photo?.startsWith('http') 
      ? portfolio.personal_info.profile_photo 
      : `${API_BASE_URL}${portfolio.personal_info.profile_photo}`
  } 
  alt="Anojaa Sukumar" 
  style={styles.profileImage} 
/>
            ) : (
              <div style={styles.placeholderAvatar}><span style={{ fontSize: '4rem' }}>👩‍💻</span></div>
            )}
            <div style={styles.floatingBadge}>AI Specialist</div>
          </div>
        </div>
      </header>

      {/* ⚡ TICKER BANNER */}
      <div style={styles.tickerBanner}>
        <span>Artificial Intelligence</span> ✦ <span>Machine Learning</span> ✦ 
        <span>FastAPI & Python</span> ✦ <span>React & Vite</span> ✦ <span>Cloud & Security</span>
      </div>

      {/* 💼 SPECIALIZATIONS & SKILLS */}
      <section id="skills" style={styles.sectionContainer}>
        <div style={styles.sectionHeaderBox}>
          <span style={styles.subHeading}>- Core Capabilities</span>
          <h2 style={styles.sectionHeading}>Technical Specializations</h2>
        </div>
        <div style={styles.skillsGrid}>
          {portfolio?.skills?.map((skill, index) => (
            <div key={index} style={styles.skillCard}>
              <div style={styles.skillIconBox}><Code2 size={24} color="#0284C7" /></div>
              <h3 style={styles.skillTitle}>{skill}</h3>
              <p style={styles.skillDesc}>Applied specialization built for production software and AI solutions.</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🟢 ABOUT ME SECTION */}
      <section id="about" style={styles.aboutDarkSection}>
        <div style={styles.aboutGrid}>
          <div style={styles.aboutLeftBox}>
            <div style={styles.statsCircle}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={styles.statNumber}>
                  {(portfolio?.projects?.length || 0) + (portfolio?.academic_projects?.length || 0)}+
                </h3>
                <span style={styles.statLabel}>Total Projects</span>
              </div>
            </div>
          </div>
          <div style={styles.aboutRightBox}>
            <span style={{ color: '#38BDF8', fontWeight: '600', fontSize: '0.9rem' }}>- Professional Summary</span>
            <h2 style={styles.aboutTitle}>About <span style={{ color: '#38BDF8' }}>Anojaa Sukumar</span></h2>
            <p style={styles.aboutText}>{portfolio?.personal_info?.about}</p>
          </div>
        </div>
      </section>

      {/* 🛠️ PROTECTED ADMIN DASHBOARD SECTION */}
      {isAdminUnlocked && (
        <section style={styles.adminSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Admin Management Dashboard
            </h2>
            <button onClick={() => setIsAdminUnlocked(false)} style={styles.adminCloseBtn}>Lock Admin</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {/* Profile Photo Uploader */}
            <div style={styles.adminFormCard}>
              <h3 style={styles.adminCardTitle}><Camera size={18} color="#0284C7" /> Profile Photo</h3>
              <form onSubmit={handleUploadPhoto} style={styles.form}>
                <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setPhotoFile(e.target.files[0])} required style={styles.input} />
                <button type="submit" style={styles.submitBtn}>Update Photo</button>
              </form>
            </div>

            {/* Admin Password Changer */}
            <div style={styles.adminFormCard}>
              <h3 style={styles.adminCardTitle}><ShieldCheck size={18} color="#0284C7" /> Change Admin Password</h3>
              <form onSubmit={handleChangePassword} style={styles.form}>
                <input type="password" placeholder="New Password" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} required style={styles.input} />
                <button type="submit" style={styles.submitBtn}>Save Password</button>
              </form>
            </div>

            {/* Add Featured Project */}
            <div style={styles.adminFormCard}>
              <h3 style={styles.adminCardTitle}>Add Featured Project</h3>
              <form onSubmit={handleAddProject} style={styles.form}>
                <input type="text" placeholder="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required style={styles.input} />
                <input type="text" placeholder="Type (e.g. AI Web App)" value={newProject.type} onChange={(e) => setNewProject({ ...newProject, type: e.target.value })} required style={styles.input} />
                <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} required style={{ ...styles.input, height: '50px' }} />
                <input type="text" placeholder="Tech Stack (comma separated)" value={newProject.tech_stack} onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })} required style={styles.input} />
                <input type="url" placeholder="GitHub Link" value={newProject.github_link} onChange={(e) => setNewProject({ ...newProject, github_link: e.target.value })} required style={styles.input} />
                <button type="submit" style={styles.submitBtn}>Save Featured</button>
              </form>
            </div>

            {/* Add University / Academic Project */}
            <div style={styles.adminFormCard}>
              <h3 style={styles.adminCardTitle}><GraduationCap size={18} color="#0284C7" /> Add Academic Project</h3>
              <form onSubmit={handleAddAcademicProject} style={styles.form}>
                <input type="text" placeholder="Title (e.g. C Threading Lab)" value={newAcademicProject.title} onChange={(e) => setNewAcademicProject({ ...newAcademicProject, title: e.target.value })} required style={styles.input} />
                <input type="text" placeholder="Module / Semester (e.g. Sem 3 - DBMS)" value={newAcademicProject.type} onChange={(e) => setNewAcademicProject({ ...newAcademicProject, type: e.target.value })} required style={styles.input} />
                <textarea placeholder="Description" value={newAcademicProject.description} onChange={(e) => setNewAcademicProject({ ...newAcademicProject, description: e.target.value })} required style={{ ...styles.input, height: '50px' }} />
                <input type="text" placeholder="Tech Stack (comma separated)" value={newAcademicProject.tech_stack} onChange={(e) => setNewAcademicProject({ ...newAcademicProject, tech_stack: e.target.value })} required style={styles.input} />
                <input type="url" placeholder="GitHub Link" value={newAcademicProject.github_link} onChange={(e) => setNewAcademicProject({ ...newAcademicProject, github_link: e.target.value })} required style={styles.input} />
                <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#0284C7' }}>Save Academic</button>
              </form>
            </div>

            {/* Upload Certificate Form */}
            <div style={styles.adminFormCard}>
              <h3 style={styles.adminCardTitle}>Upload Certificate</h3>
              <form onSubmit={handleUploadCertificate} style={styles.form}>
                <input type="text" placeholder="Title" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} required style={styles.input} />
                <input type="text" placeholder="Issuer (e.g. SLIIT)" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} required style={styles.input} />
                <input type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} required style={styles.input} />
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setCertFile(e.target.files[0])} required style={styles.input} />
                <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#10B981' }}>Upload Certificate</button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* 📁 FEATURED PROJECTS SECTION */}
      <section id="projects" style={styles.sectionContainer}>
        <div style={styles.sectionHeaderBox}>
          <span style={styles.subHeading}>- Production & AI Systems</span>
          <h2 style={styles.sectionHeading}>Featured Projects</h2>
        </div>

        <div style={styles.projectsGrid}>
          {portfolio?.projects?.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  <span style={styles.projectType}>{project.type}</span>
                </div>
                {isAdminUnlocked && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => setEditingProject({ ...project, tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : project.tech_stack })} style={styles.actionBtn}>
                      <Pencil size={14} color="#0284C7" />
                    </button>
                    <button onClick={() => handleDeleteProject(project.id, project.title)} style={styles.actionBtn}>
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                )}
              </div>
              <p style={styles.projectDesc}>{project.description}</p>
              <div style={styles.badgeContainer}>
                {project.tech_stack?.map((tech, i) => (
                  <span key={i} style={styles.techBadge}>{tech}</span>
                ))}
              </div>
              {project.github_link && (
                <a href={project.github_link} target="_blank" rel="noreferrer" style={styles.githubLink}>
                  View Repository <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 🎓 UNIVERSITY & ACADEMIC PROJECTS SECTION */}
      <section id="academic" style={{ ...styles.sectionContainer, marginTop: '5rem' }}>
        <div style={styles.sectionHeaderBox}>
          <span style={styles.subHeading}>- Coursework & Semesters</span>
          <h2 style={styles.sectionHeading}>University & Academic Projects</h2>
        </div>

        <div style={styles.projectsGrid}>
          {portfolio?.academic_projects && portfolio.academic_projects.length > 0 ? (
            portfolio.academic_projects.map((ap) => (
              <div key={ap.id} style={{ ...styles.projectCard, borderTop: '4px solid #0284C7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={styles.projectTitle}>{ap.title}</h3>
                    <span style={styles.projectType}>{ap.type}</span>
                  </div>
                  {isAdminUnlocked && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => setEditingAcademicProject({ ...ap, tech_stack: Array.isArray(ap.tech_stack) ? ap.tech_stack.join(', ') : ap.tech_stack })} style={styles.actionBtn}>
                        <Pencil size={14} color="#0284C7" />
                      </button>
                      <button onClick={() => handleDeleteAcademicProject(ap.id, ap.title)} style={styles.actionBtn}>
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    </div>
                  )}
                </div>
                <p style={styles.projectDesc}>{ap.description}</p>
                <div style={styles.badgeContainer}>
                  {ap.tech_stack?.map((tech, i) => (
                    <span key={i} style={styles.techBadge}>{tech}</span>
                  ))}
                </div>
                {ap.github_link && (
                  <a href={ap.github_link} target="_blank" rel="noreferrer" style={styles.githubLink}>
                    View Repository <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No university projects added yet. Unlock Admin to add your semester work!</p>
          )}
        </div>
      </section>

      {/* 📜 CERTIFICATIONS & LICENSES SECTION */}
      <section id="certificates" style={{ ...styles.sectionContainer, margin: '5rem auto' }}>
        <div style={styles.sectionHeaderBox}>
          <span style={styles.subHeading}>- Credentials</span>
          <h2 style={styles.sectionHeading}>Certifications & Licenses</h2>
        </div>

        <div style={styles.projectsGrid}>
          {portfolio?.certificates && portfolio.certificates.length > 0 ? (
            portfolio.certificates.map((cert) => (
              <div key={cert.id} style={styles.projectCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={styles.projectTitle}>{cert.title}</h3>
                    <span style={styles.projectType}>{cert.issuer} • Issued: {cert.issue_date}</span>
                  </div>
                  {isAdminUnlocked && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => setEditingCert(cert)} style={styles.actionBtn}>
                        <Pencil size={14} color="#0284C7" />
                      </button>
                      <button onClick={() => handleDeleteCertificate(cert.id, cert.title)} style={styles.actionBtn}>
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    </div>
                  )}
                </div>

                <div style={styles.certMediaBox}>
           {isPdf(cert.file_url) ? (
  <iframe 
    src={cert.file_url?.startsWith('http') ? cert.file_url : `${API_BASE_URL}${cert.file_url}`} 
    title={cert.title} 
    style={{ width: '100%', height: '220px', border: 'none' }} 
  />
) : (
  <img 
    src={cert.file_url?.startsWith('http') ? cert.file_url : `${API_BASE_URL}${cert.file_url}`} 
    alt={cert.title} 
    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }} 
  />
)}
</div>

<div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
  <a 
    href={cert.file_url?.startsWith('http') ? cert.file_url : `${API_BASE_URL}${cert.file_url}`} 
    target="_blank" 
    rel="noopener noreferrer" 
    style={styles.githubLink}
  >
    <ExternalLink size={14} /> View File
  </a>
                  {!isPdf(cert.file_url) && (
                    <button onClick={() => setActivePreview(cert.file_url)} style={styles.inlineBtn}>
                      <Eye size={14} /> Enlarge Image
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No certificates uploaded yet.</p>
          )}
        </div>
      </section>

      {/* 🔐 ADMIN PASSWORD MODAL */}
      {showAdminModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={18} color="#38BDF8" /> Admin Verification
              </h3>
              <button onClick={() => setShowAdminModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdminUnlock} style={styles.form}>
              <input type="password" placeholder="Enter Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required style={styles.inputDark} />
              <button type="submit" style={styles.submitBtn}>Unlock Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ EDIT FEATURED PROJECT MODAL */}
      {editingProject && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC' }}>Edit Featured Project</h3>
              <button onClick={() => setEditingProject(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProject} style={styles.form}>
              <input type="text" placeholder="Title" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} required style={styles.inputDark} />
              <input type="text" placeholder="Type" value={editingProject.type} onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })} required style={styles.inputDark} />
              <textarea placeholder="Description" value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} required style={{ ...styles.inputDark, height: '80px' }} />
              <input type="text" placeholder="Tech Stack" value={editingProject.tech_stack} onChange={(e) => setEditingProject({ ...editingProject, tech_stack: e.target.value })} required style={styles.inputDark} />
              <input type="url" placeholder="GitHub Link" value={editingProject.github_link} onChange={(e) => setEditingProject({ ...editingProject, github_link: e.target.value })} required style={styles.inputDark} />
              <button type="submit" style={styles.submitBtn}>Update Project</button>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ EDIT ACADEMIC PROJECT MODAL */}
      {editingAcademicProject && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC' }}>Edit University Project</h3>
              <button onClick={() => setEditingAcademicProject(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateAcademicProject} style={styles.form}>
              <input type="text" placeholder="Title" value={editingAcademicProject.title} onChange={(e) => setEditingAcademicProject({ ...editingAcademicProject, title: e.target.value })} required style={styles.inputDark} />
              <input type="text" placeholder="Module / Semester" value={editingAcademicProject.type} onChange={(e) => setEditingAcademicProject({ ...editingAcademicProject, type: e.target.value })} required style={styles.inputDark} />
              <textarea placeholder="Description" value={editingAcademicProject.description} onChange={(e) => setEditingAcademicProject({ ...editingAcademicProject, description: e.target.value })} required style={{ ...styles.inputDark, height: '80px' }} />
              <input type="text" placeholder="Tech Stack" value={editingAcademicProject.tech_stack} onChange={(e) => setEditingAcademicProject({ ...editingAcademicProject, tech_stack: e.target.value })} required style={styles.inputDark} />
              <input type="url" placeholder="GitHub Link" value={editingAcademicProject.github_link} onChange={(e) => setEditingAcademicProject({ ...editingAcademicProject, github_link: e.target.value })} required style={styles.inputDark} />
              <button type="submit" style={styles.submitBtn}>Update Project</button>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ IMAGE ZOOM MODAL */}
      {activePreview && (
        <div style={styles.modalOverlay} onClick={() => setActivePreview(null)}>
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <img 
  src={
    activePreview?.startsWith('http') 
      ? activePreview 
      : `${API_BASE_URL}${activePreview}`
  } 
  alt="Full Preview" 
  style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '0.5rem' }} 
/>
            <button style={styles.modalCloseBtn} onClick={() => setActivePreview(null)}>Close ✕</button>
          </div>
        </div>
      )}

      {/* 🤖 FLOATING AI RECRUITER CHATBOT */}
      <button style={styles.chatFab} onClick={() => setChatOpen(!chatOpen)}>
        <Bot size={26} color="#FFF" />
      </button>

      {chatOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.chatHeader}>
            <span>🤖 AI Portfolio Recruiter</span>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={styles.chatBody}>
            {messages.map((m, idx) => (
              <div key={idx} style={m.sender === 'bot' ? styles.botBubble : styles.userBubble}>
                {renderMessageContent(m.text)}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={styles.chatFooter}>
            <input type="text" placeholder="Ask about my projects or certificates..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} style={styles.chatInput} />
            <button type="submit" style={styles.chatSendBtn}><Send size={16} /></button>
          </form>
        </div>
      )}
    </div>
  );
}

// 🎨 STYLES
const styles = {
  pageWrapper: { backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0F172A', minHeight: '100vh' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 4rem', backgroundColor: '#0F172A', color: '#FFFFFF' },
  navLogo: { fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' },
  logoBadge: { backgroundColor: '#0284C7', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '50%', fontWeight: '800' },
  navLinks: { display: 'flex', gap: '1.75rem' },
  navLink: { color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },
  contactBtn: { backgroundColor: '#0284C7', color: '#FFF', padding: '0.6rem 1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' },
  adminLoginBtn: { backgroundColor: 'transparent', color: '#38BDF8', border: '1px solid #0284C7', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: '600' },
  adminUnlockedBtn: { backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5rem 6rem', backgroundColor: '#F0F9FF' },
  heroContent: { maxWidth: '550px' },
  greetingPill: { display: 'inline-block', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem' },
  heroTitle: { fontSize: '3rem', lineHeight: '1.2', color: '#0F172A', margin: '0 0 1rem 0', fontWeight: '800' },
  heroSubtext: { color: '#334155', fontSize: '1.05rem', lineHeight: '1.6' },
  primaryBtn: { backgroundColor: '#0284C7', color: '#FFF', padding: '0.75rem 1.5rem', borderRadius: '9999px', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' },
  secondaryBtn: { backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: '600' },
  heroPhotoWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  photoContainer: { width: '220px', height: '220px', borderRadius: '50%', border: '4px solid #0284C7', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0F2FE', boxShadow: '0 10px 25px rgba(2,132,199,0.2)' },
  profileImage: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderAvatar: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  floatingBadge: { position: 'absolute', bottom: '10px', backgroundColor: '#0284C7', color: '#FFF', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' },
  tickerBanner: { backgroundColor: '#0F172A', color: '#38BDF8', padding: '0.85rem 0', display: 'flex', justifyContent: 'space-around', fontWeight: '700', fontSize: '0.95rem' },
  sectionContainer: { maxWidth: '1100px', margin: '4rem auto 0 auto', padding: '0 2rem' },
  sectionHeaderBox: { marginBottom: '2rem' },
  subHeading: { color: '#0284C7', fontWeight: '700', fontSize: '0.9rem' },
  sectionHeading: { fontSize: '2.2rem', color: '#0F172A', margin: '0.2rem 0 0 0', fontWeight: '800' },
  skillsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  skillCard: { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.5rem' },
  skillIconBox: { backgroundColor: '#E0F2FE', width: '48px', height: '48px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  skillTitle: { fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#0F172A', fontWeight: '700' },
  skillDesc: { color: '#64748B', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 },
  aboutDarkSection: { backgroundColor: '#0F172A', color: '#FFFFFF', padding: '4rem 6rem', marginTop: '4rem' },
  aboutGrid: { maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4rem' },
  aboutLeftBox: { flex: 1, display: 'flex', justifyContent: 'center' },
  statsCircle: { width: '200px', height: '200px', borderRadius: '50%', border: '4px solid #0284C7', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' },
  statNumber: { fontSize: '2.5rem', color: '#38BDF8', margin: 0, fontWeight: '800' },
  statLabel: { fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' },
  aboutRightBox: { flex: 2 },
  aboutTitle: { fontSize: '2.2rem', margin: '0.5rem 0 1rem 0', fontWeight: '800' },
  aboutText: { color: '#E2E8F0', lineHeight: '1.7', fontSize: '1rem' },
  adminSection: { maxWidth: '1100px', margin: '3rem auto 0 auto', padding: '2rem', backgroundColor: '#F0F9FF', borderRadius: '0.75rem', border: '2px solid #0284C7' },
  adminCardTitle: { marginTop: 0, color: '#0F172A', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  adminCloseBtn: { backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: '600' },
  adminFormCard: { 
  backgroundColor: '#FFFFFF', 
  padding: '1.25rem', 
  borderRadius: '0.5rem', 
  border: '1px solid #E2E8F0',
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'space-between', // Pushes form content & button apart evenly
  height: '100%',                  // Forces equal card height across rows
  boxSizing: 'border-box'
},
  projectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  projectCard: { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  projectTitle: { margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: '700' },
  projectType: { fontSize: '0.8rem', color: '#0284C7', fontWeight: '700', display: 'block', marginTop: '0.2rem' },
  projectDesc: { color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: '0.75rem 0' },
  badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' },
  techBadge: { backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '700' },
  githubLink: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem', color: '#0284C7', fontWeight: '700', textDecoration: 'none', fontSize: '0.875rem' },
  certMediaBox: { marginTop: '0.75rem', borderRadius: '0.375rem', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' },
  inlineBtn: { background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 },
  actionBtn: { backgroundColor: '#F1F5F9', border: 'none', padding: '0.35rem', borderRadius: '0.25rem', cursor: 'pointer' },
form: { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '0.6rem', 
  flex: 1, 
  justifyContent: 'space-between'  // Forces the action button to stick cleanly to the bottom
},
  input: { padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.85rem' },
  inputDark: { padding: '0.6rem', borderRadius: '0.25rem', border: '1px solid #334155', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '0.875rem' },
submitBtn: { 
  backgroundColor: '#0284C7', 
  color: '#FFF', 
  border: 'none', 
  padding: '0.6rem', 
  borderRadius: '0.25rem', 
  cursor: 'pointer', 
  fontWeight: '700', 
  fontSize: '0.85rem',
  marginTop: 'auto'                // Pin button to bottom of container
},
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#1E293B', border: '1px solid #334155', padding: '1.75rem', borderRadius: '0.75rem', width: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
  modalCloseBtn: { marginTop: '1rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: '600' },
  chatFab: { position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: '#0F172A', border: '2px solid #0284C7', borderRadius: '50%', width: '60px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(2,132,199,0.4)' },
  chatWindow: { position: 'fixed', bottom: '6.5rem', right: '2rem', width: '350px', height: '430px', backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 999 },
  chatHeader: { backgroundColor: '#0F172A', color: '#FFF', padding: '0.85rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatBody: { flex: 1, padding: '0.75rem', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#F8FAFC' },
  botBubble: { backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', alignSelf: 'flex-start', maxWidth: '88%', fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' },
  userBubble: { backgroundColor: '#0284C7', color: '#FFF', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', alignSelf: 'flex-end', maxWidth: '88%', fontSize: '0.875rem', fontWeight: '500', wordBreak: 'break-word' },
  chatFooter: { display: 'flex', borderTop: '1px solid #E2E8F0', padding: '0.5rem', backgroundColor: '#FFFFFF' },
  chatInput: { flex: 1, border: 'none', padding: '0.5rem', outline: 'none', fontSize: '0.875rem', color: '#0F172A' },
  chatSendBtn: { backgroundColor: '#0284C7', color: '#FFF', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '0.25rem', cursor: 'pointer' }
};