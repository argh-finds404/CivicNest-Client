import React, { useState, useEffect } from'react';
import { useParams, Link, useNavigate, useLocation } from'react-router';
import toast from'react-hot-toast';
import { motion, AnimatePresence } from'framer-motion';
import FlairPill from'../common/FlairPill';
import StatusBadge from'../common/StatusBadge';
import CommentBox from'../forms/CommentBox';
import ContributionModal from'../forms/ContributionModal';
import ResolutionProofPanel from'./ResolutionProofPanel';
import'remixicon/fonts/remixicon.css';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import { useAuth } from'../../hooks/useAuth';
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import { jsPDF } from'jspdf';
import CommentList from'./CommentList';
import SEO from'../common/SEO';

const ImageCarousel = ({ images }) => {
 const [currentIndex, setCurrentIndex] = useState(0);

 if (!images || images.length === 0) return null;

 return (
 <div className="mb-2">
 <div className="relative w-full h-[400px] md:h-[500px] rounded-t-[1.5rem] overflow-hidden bg-slate-900 shadow-inner group">
 <AnimatePresence mode="wait">
 <motion.img 
 key={currentIndex}
 src={images[currentIndex]} 
 initial={{ opacity: 0, scale: 1.05 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full h-full object-contain"alt={`Issue photo ${currentIndex + 1}`}
 />
 </AnimatePresence>
 
 {images.length > 1 && (
 <>
 <button 
 onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
 className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm">
 <i className="ri-arrow-left-s-line text-2xl tracking-tight"></i>
 </button>
 <button 
 onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
 className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm">
 <i className="ri-arrow-right-s-line text-2xl tracking-tight"></i>
 </button>
 </>
 )}
 </div>
 
 {images.length > 1 && (
 <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
 {images.map((img, idx) => (
 <button 
 key={idx}
 onClick={() => setCurrentIndex(idx)}
 className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${currentIndex === idx ?'ring-2 ring-[#40826D] ring-offset-2 scale-105':'opacity-60 hover:opacity-100'}`}
 >
 <img src={img} className="w-full h-full object-cover"alt={`Thumbnail ${idx + 1}`} />
 </button>
 ))}
 </div>
 )}
 </div>
 );
};

const IssueDetails = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const [issue, setIssue] = useState(null);
 const [comments, setComments] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [aiSummary, setAiSummary] = useState("");
 const [summaryLoading, setSummaryLoading] = useState(false);
 const [generatedLetter, setGeneratedLetter] = useState("");
 const [letterLoading, setLetterLoading] = useState(false);
 const [letterModalOpen, setLetterModalOpen] = useState(false);
 const [claiming, setClaiming] = useState(false);
 const [voteAnimation, setVoteAnimation] = useState(null);
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const { user } = useAuth();

 // Civic Escalation Track states
 const [profileData, setProfileData] = useState(null);
 const [areaIssuesCount, setAreaIssuesCount] = useState(0);
 const [qrModalOpen, setQrModalOpen] = useState(false);
 const [forceEscalation, setForceEscalation] = useState(false);
 const [forceRti, setForceRti] = useState(false);

 const handleAiSummarize = async () => {
 setSummaryLoading(true);
 try {
 const commentsText = comments.map(c => c.body).join('.');
 const contentText =`Issue: ${issue.title}. Description: ${issue.description}. Comments: ${commentsText}`;
 const res = await axiosSecure.post('/ai/summarize', {
 content: contentText,
 });
 setAiSummary(res.data.summary);
 } catch (err) {
 toast.error(err.response?.data?.message ||"Failed to generate AI summary.");
 } finally {
 setSummaryLoading(false);
 }
 };

 const handleGenerateLetter = async () => {
 setLetterLoading(true);
 try {
 const commentsText = comments.map(c => c.body).join('.');
 const contentText =`Issue: ${issue.title}. Description: ${issue.description}. Comments: ${commentsText}`;
 const res = await axiosSecure.post('/ai/complaint-letter', {
 content: contentText,
 });
 setGeneratedLetter(res.data.letter);
 setLetterModalOpen(true);
 } catch (err) {
 toast.error(err.response?.data?.message ||"Failed to generate complaint letter.");
 } finally {
 setLetterLoading(false);
 }
 };

 const downloadLetterPDF = () => {
 const doc = new jsPDF();
 doc.setFont("helvetica","normal");
 doc.setFontSize(12);
 const splitText = doc.splitTextToSize(generatedLetter, 180);
 doc.text(splitText, 15, 20);
 doc.save(`CivicNest_Complaint_${issue._id.slice(-6).toUpperCase()}.pdf`);
 toast.success("Complaint letter PDF downloaded!");
 };

 useEffect(() => {
 const fetchIssueData = async () => {
 try {
 const res = await axiosPublic.get(`/issues/${id}`);
 setIssue(res.data);
 
 const commentsRes = await axiosPublic.get(`/issues/${id}/comments`);
 setComments(commentsRes.data);
 } catch (error) {
 toast.error(error.message);
 } finally {
 setIsLoading(false);
 }
 };
 fetchIssueData();
 }, [id, axiosPublic]);

 // Load user profile details for RTI draft
 useEffect(() => {
   if (!user) return;
   const fetchProfile = async () => {
     try {
       const res = await axiosSecure.get("/users/my");
       setProfileData(res.data);
     } catch (err) {
       console.error("Failed to load user profile in details page", err);
     }
   };
   fetchProfile();
 }, [user, axiosSecure]);

 // Check pattern of recurring failures (issues of same category in same area)
 useEffect(() => {
   if (!issue) return;
   const fetchAreaIssues = async () => {
     try {
       const res = await axiosPublic.get(`/issues?area=${encodeURIComponent(issue.area)}&category=${encodeURIComponent(issue.category)}`);
       const matched = res.data?.issues || [];
       const count = matched.filter(i => i._id !== issue._id).length + 1;
       setAreaIssuesCount(count);
     } catch (err) {
       console.error("Failed to fetch nearby issues pattern", err);
     }
   };
   fetchAreaIssues();
 }, [issue, axiosPublic]);

 const handleVote = async (type) => {
 try {
 const res = await axiosSecure.patch(`/issues/${id}/${type}`);
 const data = res.data;
 
 const diff = type ==='upvote'? (data.upvotes.length - (issue.upvotes?.length || 0))
 : (data.downvotes.length - (issue.downvotes?.length || 0));

 if (diff !== 0) {
 setVoteAnimation({
 id: Date.now(),
 target: type,
 value: diff > 0 ?`+${diff}`:`${diff}`,
 color: diff > 0 ? (type ==='upvote'?'text-emerald-500':'text-rose-400') :'text-slate-400'});
 setTimeout(() => setVoteAnimation(null), 1000);
 }

 setIssue({ 
 ...issue, 
 netScore: data.netScore, 
 userVote: data.userVote,
 upvotes: data.upvotes,
 downvotes: data.downvotes
 });
 } catch (error) {
 toast.error(error.response?.data?.error || error.message);
 }
 };

 const handleCommentAdded = (newComment) => {
 setComments([...comments, newComment]);
 setIssue({ ...issue, commentCount: issue.commentCount + 1 });
 };

 const handleCommentUpdated = (updatedComment) => {
 setComments(comments.map(c => c._id === updatedComment._id ? updatedComment : c));
 };

 const handleCommentDeleted = (commentId) => {
 setComments(comments.filter(c => c._id !== commentId));
 setIssue({ ...issue, commentCount: Math.max(0, issue.commentCount - 1) });
 };

 const handleContributeSuccess = (payload) => {
 const updatedRaised = (issue.crowdfunding?.raised || 0) + payload.amount;
 setIssue({
 ...issue,
 crowdfunding: {
 ...issue.crowdfunding,
 raised: updatedRaised
 }
 });
 };

 const handleWitnessToggle = async () => {
 if (!user) {
 toast.error("Please login to verify witnessing this issue");
 return;
 }
 try {
 const res = await axiosSecure.post(`/issues/${id}/witness`, {
 photoURL: user.photoURL,
 name: user.displayName || user.email
 });
 setIssue({ ...issue, witnesses: res.data.witnesses, witnessDetails: res.data.witnessDetails });
 } catch (error) {
 toast.error("Failed to update witness status");
 }
 };

 const handleVerifyResolution = async () => {
 if (!user) {
 toast.error("Please login to verify");
 return;
 }
 try {
 const res = await axiosSecure.post(`/issues/${id}/verify`);
 setIssue({ ...issue, verifications: res.data.verifications, status: res.data.status });
 toast.success("Verification submitted!");
 } catch (error) {
 toast.error("Failed to verify resolution");
 }
 };

 const handleProofUploaded = (proofs) => {
 setIssue({ ...issue, resolutionProofs: proofs, status:'pending_verification'});
 };

 const handleClaim = async () => {
 if (!user) return toast.error("Please login to claim issues.");
 setClaiming(true);
 try {
 const res = await axiosSecure.post(`/issues/${id}/claim`);
 setIssue(res.data.issue);
 toast.success("Issue claimed successfully!");
 } catch (error) {
 toast.error(error.response?.data?.message ||"Failed to claim issue.");
 } finally {
 setClaiming(false);
 }
 };

 const handleUnclaim = async () => {
  if (!window.confirm("Are you sure you want to step down from this issue?")) return;
  try {
  await axiosSecure.post(`/issues/${id}/unclaim`);
  setIssue({ ...issue, assignedTo: null, status:'open'});
  toast.success("You have stepped down from this issue.");
  } catch (error) {
  toast.error(error.response?.data?.message ||"Failed to unclaim issue.");
  }
  };

  const upvotesCount = issue?.upvotes?.length || 0;
  const daysOpen = issue ? Math.floor((Date.now() - new Date(issue.submittedAt || issue.incidentDate)) / 86400000) : 0;
  
  const qualifiesForGovtEscalation = forceEscalation || (upvotesCount >= 15 && daysOpen >= 7 && issue?.status !== 'solved');
  const qualifiesForRti = forceRti || (daysOpen >= 60 && issue?.status !== 'solved');

  const copySmsText = () => {
    if (!issue) return;
    const smsBody = `CivicNest Escalation Ref: #${issue._id.slice(-6).toUpperCase()}. Category: ${issue.category}. Location: ${issue.area}. Grievance: ${issue.title}. Upvotes: ${upvotesCount}. Please resolve this issue.`;
    navigator.clipboard.writeText(smsBody);
    toast.success("SMS pre-filled text copied to clipboard!");
  };

  const handleEmailEscalate = async (cityCorpEmail) => {
    if (!issue) return;
    let letter = generatedLetter;
    if (!letter) {
      setLetterLoading(true);
      toast.loading("Generating complaint letter...");
      try {
        const commentsText = comments.map(c => c.body).join('.');
        const contentText = `Issue: ${issue.title}. Description: ${issue.description}. Comments: ${commentsText}`;
        const res = await axiosSecure.post('/ai/complaint-letter', {
          content: contentText,
        });
        letter = res.data.letter;
        setGeneratedLetter(letter);
        toast.dismiss();
      } catch (err) {
        toast.dismiss();
        letter = `To,\nThe Chief Officer,\nDhaka City Corporation,\nBangladesh.\n\nSubject: Official escalation of civic grievance "${issue.title}" at ${issue.area}.\n\nReference ID: #${issue._id.slice(-6).toUpperCase()}\n\nDear Sir,\n\nI am writing on behalf of the CivicNest community to escalate the issue: "${issue.title}".\nDetails: ${issue.description}\nLocation: ${issue.location || issue.area}\n\nThis issue has received ${upvotesCount} community upvotes and remains unresolved.\n\nSincerely,\n${user?.displayName || "Community Resident"}`;
      } finally {
        setLetterLoading(false);
      }
    }
    
    const mailtoUrl = `mailto:${cityCorpEmail}?subject=${encodeURIComponent(`CivicNest Escalation: ${issue.title} (Ref: #${issue._id.slice(-6).toUpperCase()})`)}&body=${encodeURIComponent(letter)}`;
    window.open(mailtoUrl, '_blank');
    toast.success("Opening default mail application...");
  };

  const downloadRtiRequestPDF = () => {
    if (!issue) return;
    const doc = new jsPDF();
    
    // Design and Header
    doc.setFillColor(15, 118, 110); // Emerald header block
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("CIVICNEST ESCALATION: RTI INQUIRY", 15, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Right to Information Act, 2009 (Bangladesh)", 15, 25);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    
    let y = 45;
    const addLine = (label, val, boldVal = false) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 15, y);
      doc.setFont("helvetica", boldVal ? "bold" : "normal");
      doc.text(val, 65, y);
      y += 8;
    };
    
    doc.setFont("helvetica", "bold");
    doc.text("To,", 15, y); y += 6;
    doc.setFont("helvetica", "normal");
    doc.text("The Designated Officer (RTI Cell),", 15, y); y += 6;
    doc.text("Dhaka City Corporation / Local Government Division,", 15, y); y += 6;
    doc.text("Dhaka, Bangladesh.", 15, y); y += 12;
    
    addLine("Subject:", "Application for Obtaining Information under the RTI Act, 2009", true);
    y += 4;
    
    doc.setFont("helvetica", "normal");
    const introText = "In accordance with Section 6 of the Right to Information Act, 2009 of Bangladesh, I, the undersigned citizen, request the following details concerning a chronic public grievance that has remained unaddressed.";
    const splitIntro = doc.splitTextToSize(introText, 180);
    doc.text(splitIntro, 15, y);
    y += splitIntro.length * 5 + 8;
    
    addLine("1. Applicant Name:", user?.displayName || "Community Member");
    addLine("2. Address/Neighborhood:", profileData?.area || issue.area || "Dhaka, Bangladesh");
    addLine("3. Contact Number:", profileData?.phone || "Not provided");
    addLine("4. Email Address:", user?.email || "Not provided");
    y += 4;
    
    doc.setFont("helvetica", "bold");
    doc.text("5. Specific Information Demanded:", 15, y);
    y += 6;
    
    doc.setFont("helvetica", "normal");
    const infoDetails = `Progress reports, inspection logs, and budgetary allocations regarding the unresolved issue titled "${issue.title}" (Platform Reference: #${issue._id.slice(-6).toUpperCase()}) which was officially registered on ${new Date(issue.submittedAt).toLocaleDateString()} at location: ${issue.location || issue.area}.\n\nSpecifically:\n- Has any inspection team been dispatched to the site in the last 60 days?\n- If yes, please provide a copy of their report.\n- If no action has been taken, please provide the official reasoning or scheduling constraints.`;
    const splitDetails = doc.splitTextToSize(infoDetails, 180);
    doc.text(splitDetails, 15, y);
    y += splitDetails.length * 5 + 10;
    
    addLine("6. Mode of Delivery Preferred:", "Digital Copy via Email / Printed Copy");
    y += 10;
    
    doc.text("I declare that the information requested falls within the scope of public interest and is not subject to exclusions under Section 7 of the Act.", 15, y);
    y += 15;
    
    doc.text("Date: " + new Date().toLocaleDateString(), 15, y);
    doc.text("Signature: __________________________", 110, y);
    
    doc.save(`RTI_Draft_Issue_${issue._id.slice(-6).toUpperCase()}.pdf`);
    toast.success("RTI application draft downloaded successfully!");
  };

  const downloadCommissionerBriefPDF = () => {
    if (!issue) return;
    const doc = new jsPDF();
    
    // Header styling
    doc.setFillColor(239, 68, 68); // Red banner for warning
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("CIVIC EVIDENCE BRIEF: CHRONIC INFRASTRUCTURE FAILURE", 15, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Official Data-Backed Request to Ward Commissioner | Generated: ${new Date().toLocaleDateString()}`, 15, 26);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    
    let y = 50;
    
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary:", 15, y); y += 6;
    doc.setFont("helvetica", "normal");
    const summaryText = `This brief compiles public complaints, photographic history, and community sentiment detailing a recurring, unresolved failure of public utilities/cleanliness at ${issue.area}. The community requests a transition from short-term patch-repairs to a permanent municipal intervention.`;
    const splitSummary = doc.splitTextToSize(summaryText, 180);
    doc.text(splitSummary, 15, y);
    y += splitSummary.length * 5 + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("Key Grievance Information:", 15, y); y += 6;
    
    const addBriefLine = (label, val) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(val, 65, y);
      y += 8;
    };
    
    addBriefLine("Target Location:", issue.location || issue.area);
    addBriefLine("Issue Category:", issue.category);
    addBriefLine("Initial Report Date:", new Date(issue.submittedAt).toLocaleDateString());
    addBriefLine("Community Score:", `${issue.netScore || 0} Upvotes / Witnesses`);
    addBriefLine("Detected Cluster Size:", `${areaIssuesCount} related reports in this Ward`);
    y += 4;
    
    doc.setFont("helvetica", "bold");
    doc.text("Arguments for Permanent Remediation:", 15, y); y += 6;
    
    doc.setFont("helvetica", "normal");
    const argumentsText = `1. Cost-Inefficiency: The local municipality has conducted repeated temporary cleans/fixes. However, the root cause remains unaddressed, leading to further decay and a waste of public sanitation budget.\n2. Public Health & Hazards: The issue is causing waterlogging, odor, or safety hazards for residents in the immediate vicinity of ${issue.area}.\n3. Public Sentiment: ${issue.upvotes?.length || 0} citizens have explicitly upvoted this ticket, indicating widespread local demand for a permanent solution.`;
    const splitArgs = doc.splitTextToSize(argumentsText, 180);
    doc.text(splitArgs, 15, y);
    y += splitArgs.length * 5 + 12;
    
    doc.setFont("helvetica", "bold");
    doc.text("Action Demanded:", 15, y); y += 6;
    
    doc.setFont("helvetica", "normal");
    const actionText = `We petition the Ward Commissioner's office to conduct a full engineering assessment of this location's drains/roads and allocate capital project budget for a permanent overhaul.`;
    const splitAction = doc.splitTextToSize(actionText, 180);
    doc.text(splitAction, 15, y);
    y += splitAction.length * 5 + 12;
    
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`CivicNest Public Records Ref: #${issue._id.slice(-6).toUpperCase()} | Verify online at community portal.`, 15, y);
    
    doc.save(`Commissioner_Data_Brief_${issue.area.replace(/\s+/g, '_')}.pdf`);
    toast.success("Ward Commissioner Data Brief downloaded!");
  };

  const handlePrintQR = () => {
    if (!issue) return;
    const printWindow = window.open('', '_blank');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Poster - CivicNest</title>
          <style>
            body { font-family: 'HKGrotesk', 'Segoe UI', sans-serif; text-align: center; padding: 40px; color: #0f172a; background: #fff; }
            .card { border: 4px solid #0f766e; border-radius: 32px; padding: 40px; max-width: 600px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.05); text-align: center; }
            .logo { font-size: 32px; font-weight: 800; color: #0f766e; margin-bottom: 5px; letter-spacing: -1px; }
            .logo span { color: #10b981; }
            .tagline { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 35px; }
            .badge { display: inline-block; background: #fee2e2; color: #ef4444; font-size: 12px; font-weight: 800; padding: 6px 16px; rounded: 9999px; text-transform: uppercase; letter-spacing: 1px; border-radius: 9999px; margin-bottom: 25px; }
            .qr-container { background: #f8fafc; border: 3px dashed #cbd5e1; padding: 25px; border-radius: 24px; display: inline-block; margin-bottom: 30px; }
            .qr-img { width: 250px; height: 250px; display: block; }
            .title { font-size: 26px; font-weight: 900; margin-bottom: 12px; color: #0f172a; line-height: 1.2; }
            .meta { font-size: 15px; color: #475569; font-weight: 750; margin-bottom: 30px; }
            .instructions { font-size: 15px; font-weight: 750; color: #0f766e; background: #ccfbf1; padding: 18px; border-radius: 16px; line-height: 1.4; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Civic<span>Nest</span></div>
            <div class="tagline">Community Cleanliness Portal</div>
            <span class="badge">Chronic Trouble Spot</span>
            <div class="title">${issue.title}</div>
            <div class="meta">Location: ${issue.area} • Reference: #${issue._id.slice(-6).toUpperCase()}</div>
            <div class="qr-container">
              <img class="qr-img" src="${qrUrl}" alt="QR Code" />
            </div>
            <div class="meta" style="margin-top: 5px;">This spot has been reported/voted ${upvotesCount} times.</div>
            <div class="instructions">
              <strong>WALKING BY? REPORT THIS SPOT IN ONE TAP!</strong><br/>
              Scan this QR code with your phone camera to view the status, check cleanup history, or upvote to request urgent action.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

 if (isLoading) return <div className="text-center py-32"><MinimalLoader /></div>;
 if (!issue) return <div className="text-center py-32 text-2xl tracking-tight font-bold">Issue not found.</div>;

 const formattedDate = new Date(issue.submittedAt || issue.incidentDate).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', hour12: true });
 const authorName = issue.isAnonymous ?"Anonymous Member": issue.submittedBy?.name ||"User";
 const authorPhoto = issue.submittedBy?.photoURL;

 const isClaimer = issue.assignedTo?.email === user?.email;
 const isReporter = issue.submittedBy?.userId === user?.uid;
 const isAssigned = !!issue.assignedTo;
 const isClaimable = issue.approvalStatus ==='approved'&& issue.status ==='open'&& !isAssigned
 && !isReporter;

 return (
 <div className="bg-[#F8FAFC] min-h-screen font-body text-[#111] pt-10 pb-20">
 <SEO 
    title={issue?.title ? `${issue.title} - Incident Details` : "Incident Details"} 
    description={issue?.description?.slice(0, 155)} 
    image={issue?.images?.[0]} 
    type="article" 
  />
 
 {/* Top navigation - Moved outside the grid to fix alignment */}
 <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6 flex items-center gap-3">
 <BackButton variant="dark"/>
 <span className="text-slate-500 dark:text-slate-300 font-bold">{location.state?.from ==='personal'?'Go Back':'Back to Feed'}</span>
 </div>

 <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 px-4 md:px-6">
 
 {/* Main Content Column */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="flex-grow flex flex-col gap-4 min-w-0">

 {/* Main Content Card (Images + Title + Meta + Description + Interactions) */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden">
 
 {/* Images at the top of the card */}
 {issue.images?.length > 0 && (
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-t-[1.5rem]">
 <div className="rounded-t-[1.5rem] overflow-hidden">
 <ImageCarousel images={issue.images} />
 </div>
 </div>
 )}

 <div className="p-4 md:p-5">
 {/* Title & Status */}
 <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-3 flex-wrap">
 <FlairPill category={issue.category} customFlair={issue.customFlair} />
 <StatusBadge status={issue.status} />
 </div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 {issue.title}
 </h1>
 </div>
 </div>

 {/* Meta Row (Author, Date, Location) */}
 <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-slate-500 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50 p-3 rounded-lg border border-slate-100">
 <div className="flex items-center gap-2">
 {issue.isAnonymous ? (
 <>
 <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center justify-center text-slate-500 dark:text-slate-300">
 <i className="ri-spy-fill"></i>
 </div>
 <span className="font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{authorName}</span>
 </>
 ) : (
 <Link to={`/user/${issue.submittedBy?.userId}`} className="flex items-center gap-2 group/author">
 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden flex items-center justify-center text-slate-400 group-hover/author:ring-2 ring-[#0f766e] transition-all">
 {authorPhoto ? <img src={authorPhoto} alt="Author"className="w-full h-full object-cover"/> : <i className="ri-user-line text-[13px]"></i>}
 </div>
 <span className="font-bold text-slate-800 dark:text-white group-hover/author:text-[#0f766e] transition-colors">{authorName}</span>
 </Link>
 )}
 </div>
 
 <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
 
 <div className="flex items-center gap-1.5">
 <i className="ri-calendar-event-line text-slate-400 text-[13px]"></i> 
 <span className="font-medium">{formattedDate}</span>
 </div>
 
 <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
 
 <div className="flex items-center gap-1.5">
 <i className="ri-map-pin-line text-slate-400 text-[13px]"></i> 
 <span className="font-medium max-w-[300px] sm:max-w-[500px] truncate"title={issue.location ?`${issue.area} • ${issue.location}`: issue.area}>
 {issue.area}{issue.location ?`• ${issue.location.split(',').slice(0,3).join(',')}`:''}
 </span>
 </div>
 </div>

 {/* Description */}
 {/* AI Toolkit Actions */}
 <div className="flex flex-wrap gap-2.5 mb-6">
 <button 
 type="button"onClick={handleAiSummarize} 
 disabled={summaryLoading}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-[#0f766e] dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100/50 transition-all cursor-pointer">
 {summaryLoading ? (
 <><i className="ri-loader-4-line animate-spin"></i> Summarizing...</>
 ) : (
 <><i className="ri-sparkles-line"></i> AI Summary</>
 )}
 </button>

 <button 
 type="button"onClick={handleGenerateLetter} 
 disabled={letterLoading}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 hover:bg-blue-100/50 transition-all cursor-pointer">
 {letterLoading ? (
 <><i className="ri-loader-4-line animate-spin"></i> Generating Letter...</>
 ) : (
 <><i className="ri-file-text-line"></i> Generate Official Complaint</>
 )}
 </button>
 </div>

 {/* AI Summary Display */}
 {aiSummary && (
 <div className="mb-6 p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950 rounded-xl relative">
 <button type="button"onClick={() => setAiSummary("")} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
 <i className="ri-sparkles-fill text-yellow-500"></i> AI Issue Summary
 </h4>
 <p className="text-[13px] text-slate-750 dark:text-[#cbd5e1] leading-relaxed font-semibold">{aiSummary}</p>
 </div>
 )}

 <div className="prose max-w-none text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-[13px] leading-relaxed whitespace-pre-wrap font-medium mb-8">
 {issue.description}
 </div>

 {/* Interaction Bar (Bottom of card) */}
 <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
 <div className="flex items-center gap-3">
 <div className="relative">
 <AnimatePresence>
 {voteAnimation?.target ==='upvote'&& (
 <motion.span
 key={voteAnimation.id}
 initial={{ opacity: 0, y: 0, scale: 0.5 }}
 animate={{ opacity: 1, y: -25, scale: 1.2 }}
 exit={{ opacity: 0, y: -40, scale: 1 }}
 transition={{ duration: 0.6, ease:"easeOut"}}
 className={`absolute top-0 left-1/2 -translate-x-1/2 font-extrabold ${voteAnimation.color} pointer-events-none drop-shadow-sm z-10`}
 >
 {voteAnimation.value}
 </motion.span>
 )}
 </AnimatePresence>
 <button 
 onClick={() => handleVote("upvote")}
 disabled={issue.approvalStatus !=='approved'|| isReporter}
 className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-bold text-[13px] border ${issue.userVote ==='up'?'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-sm':'text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-emerald-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
 >
 <i className={issue.userVote ==='up'?"ri-thumb-up-fill text-[13px]":"ri-thumb-up-line text-[13px]"}></i> 
 <span className="hidden sm:inline">Upvote</span>
 {issue.upvotes?.length > 0 && <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${issue.userVote ==='up'?'bg-emerald-100 text-emerald-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>{issue.upvotes.length}</span>}
 </button>
 </div>

 <div className="relative">
 <AnimatePresence>
 {voteAnimation?.target ==='downvote'&& (
 <motion.span
 key={voteAnimation.id}
 initial={{ opacity: 0, y: 0, scale: 0.5 }}
 animate={{ opacity: 1, y: -25, scale: 1.2 }}
 exit={{ opacity: 0, y: -40, scale: 1 }}
 transition={{ duration: 0.6, ease:"easeOut"}}
 className={`absolute top-0 left-1/2 -translate-x-1/2 font-extrabold ${voteAnimation.color} pointer-events-none drop-shadow-sm z-10`}
 >
 {voteAnimation.value}
 </motion.span>
 )}
 </AnimatePresence>
 <button 
 onClick={() => handleVote("downvote")}
 disabled={issue.approvalStatus !=='approved'|| isReporter}
 className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-bold text-[13px] border ${issue.userVote ==='down'?'text-rose-500 bg-rose-50 border-rose-200 shadow-sm':'text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-rose-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
 >
 <i className={issue.userVote ==='down'?"ri-thumb-down-fill text-[13px]":"ri-thumb-down-line text-[13px]"}></i> 
 <span className="hidden sm:inline">Downvote</span>
 {issue.downvotes?.length > 0 && <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${issue.userVote ==='down'?'bg-rose-100 text-rose-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>{issue.downvotes.length}</span>}
 </button>
 </div>
 </div>
 
 <div className="relative flex items-center mt-2 sm:mt-0">
 <button 
 onClick={handleWitnessToggle}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-bold text-[13px] border ${issue.witnesses?.includes(user?.uid) ?'bg-teal-50 border-teal-200 text-[#0f766e] shadow-sm':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]'}`}
 >
 <i className={issue.witnesses?.includes(user?.uid) ?"ri-checkbox-circle-fill text-[13px]":"ri-eye-line text-[13px]"}></i> 
 {issue.witnesses?.includes(user?.uid) ?'Witnessed':'Witness'}
 </button>
 
 {(issue.witnesses?.length > 0) && (
 <div className="flex -space-x-1.5 absolute -left-2 -bottom-2 z-10">
 {issue.witnesses.slice(0, 5).map((uid, i) => {
 const detail = issue.witnessDetails?.find(d => d.userId === uid);
 const photo = detail?.photoURL;
 return (
 <div key={uid || i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border-2 border-white flex items-center justify-center overflow-hidden shadow-sm"style={{ zIndex: 10 - i }}>
 {photo ? (
 <img src={photo} alt="witness"className="w-full h-full object-cover"/>
 ) : (
 <i className="ri-user-fill text-slate-400 text-[10px]"></i>
 )}
 </div>
 );
 })}
 {issue.witnesses.length > 5 && (
 <div className="w-6 h-6 rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-2 border-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
 +{issue.witnesses.length - 5}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Civic Escalation & Authority Action Bridge */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] p-4 md:p-5 flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1e3040]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-emerald-950/20 text-[#0f766e] dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
          <i className="ri-government-line"></i>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-905 dark:text-white leading-tight" style={{ fontFamily: 'HKGrotesk, sans-serif' }}>
            Civic Escalation Track
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bypassing internal community loop to municipal departments</p>
        </div>
      </div>
      
      {/* Simulation options */}
      <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {!qualifiesForGovtEscalation && (
          <button 
            type="button"
            onClick={() => { setForceEscalation(true); toast.success("Gov Escalation Simulation active!"); }}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1e3040] hover:bg-slate-200 dark:hover:bg-[#2c4035] text-slate-600 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#1e3040] cursor-pointer"
          >
            Force Gov Bridge
          </button>
        )}
        {!qualifiesForRti && (
          <button 
            type="button"
            onClick={() => { setForceRti(true); toast.success("RTI Simulation active!"); }}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1e3040] hover:bg-slate-200 dark:hover:bg-[#2c4035] text-slate-600 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#1e3040] cursor-pointer"
          >
            Force RTI
          </button>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Box 1: Government Bridge (333 & City Corp) */}
      <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${qualifiesForGovtEscalation ? 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-200 dark:border-amber-900' : 'bg-slate-50/50 dark:bg-[#0b1215]/30 border-slate-150 dark:border-[#1e3040]'}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Helpline & City Corp Bridge</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${qualifiesForGovtEscalation ? 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350' : 'bg-slate-100 dark:bg-[#1e3040] text-slate-500'}`}>
              {qualifiesForGovtEscalation ? 'Active' : 'Locked'}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-[13px] mb-1">Escalate Government Complaint</h4>
          <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mb-4">
            Pre-fills official complaints into 333 SMS or direct emails to the City Corporation departments once an issue has 15+ upvotes.
          </p>
        </div>

        {qualifiesForGovtEscalation ? (
          <div className="space-y-2 mt-auto">
            <div className="flex gap-2">
              <a 
                href={`sms:333?body=${encodeURIComponent(`CivicNest Escalation Ref: #${issue._id.slice(-6).toUpperCase()}. Category: ${issue.category}. Location: ${issue.area}. Grievance: ${issue.title}. Upvotes: ${upvotesCount}. Please resolve this issue.`)}`}
                className="flex-1 py-2 bg-[#40826D] hover:bg-[#326756] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <i className="ri-chat-3-line text-xs"></i> SMS to 333
              </a>
              <button 
                type="button"
                onClick={copySmsText}
                className="px-3 py-2 bg-slate-100 dark:bg-[#1e3040] hover:bg-slate-200 text-slate-700 dark:text-[#cbd5e1] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                title="Copy SMS text"
              >
                <i className="ri-clipboard-line"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => handleEmailEscalate('complaints@dncc.gov.bd')}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <i className="ri-mail-send-line"></i> DNCC Email
              </button>
              <button 
                type="button"
                onClick={() => handleEmailEscalate('complaints@dscc.gov.bd')}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <i className="ri-mail-send-line"></i> DSCC Email
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <div className="flex justify-between text-[9px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">
              <span>Threshold Progress</span>
              <span>{Math.min(upvotesCount, 15)}/15 Votes • {Math.min(daysOpen, 7)}/7 Days</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-[#1e3040] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(((upvotesCount + (daysOpen * 2.14)) / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Box 2: RTI Petition (60+ days) */}
      <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${qualifiesForRti ? 'bg-indigo-50/20 dark:bg-indigo-950/5 border-indigo-200 dark:border-indigo-900' : 'bg-slate-50/50 dark:bg-[#0b1215]/30 border-slate-150 dark:border-[#1e3040]'}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">RTI Act 2009 Inquiry</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${qualifiesForRti ? 'bg-indigo-100 text-indigo-850 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-slate-100 dark:bg-[#1e3040] text-slate-500'}`}>
              {qualifiesForRti ? 'Available' : 'Pending'}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-[13px] mb-1">Draft Right to Information Application</h4>
          <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mb-4">
            If an issue remains ignored for 60+ days, generate a legally structured RTI Form Ka (Act 2009) to demand public logs and reasons for delay.
          </p>
        </div>

        <div className="mt-auto">
          {qualifiesForRti ? (
            <button 
              type="button"
              onClick={downloadRtiRequestPDF}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="ri-file-shield-2-line"></i> Export RTI Application
            </button>
          ) : (
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1e3040] p-2 rounded-lg flex items-center justify-center gap-2">
              <i className="ri-time-line"></i> Unlocks in {Math.max(60 - daysOpen, 0)} days of inaction
            </div>
          )}
        </div>
      </div>

      {/* Box 3: Physical-World QR Poster */}
      <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-[#0b1215]/30 border-slate-150 dark:border-[#1e3040] flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#40826D] uppercase tracking-widest mb-2 block">Physical-Digital Bridging</span>
          <h4 className="font-bold text-slate-900 dark:text-white text-[13px] mb-1">Print Location QR Stickers</h4>
          <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mb-4">
            Generate and print a layout-ready flyer with a QR code referencing this trouble spot. Pedestrians can scan it to instantly report or view status.
          </p>
        </div>
        <button 
          type="button"
          onClick={() => setQrModalOpen(true)}
          className="w-full py-2 bg-[#40826D]/10 hover:bg-[#40826D]/20 text-[#40826D] dark:text-emerald-400 text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
        >
          <i className="ri-qr-code-line"></i> Customize QR Sticker
        </button>
      </div>

      {/* Box 4: Pattern Detection & Commissioner Brief */}
      <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${areaIssuesCount >= 3 ? 'bg-rose-50/20 dark:bg-rose-950/5 border-rose-250 dark:border-rose-900' : 'bg-slate-50/50 dark:bg-[#0b1215]/30 border-slate-150 dark:border-[#1e3040]'}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-450 uppercase tracking-widest">Chronic Site Analysis</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${areaIssuesCount >= 3 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-350' : 'bg-slate-100 dark:bg-[#1e3040] text-slate-500'}`}>
              {areaIssuesCount >= 3 ? 'Chronic Failure' : 'Normal'}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-[13px] mb-1">Ward Commissioner Data Brief</h4>
          <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mb-4">
            Detects repeating patterns in this area. Generates a data brief request arguing that patching is inefficient and permanent redesign is needed.
          </p>
        </div>

        <div className="mt-auto">
          {areaIssuesCount >= 3 ? (
            <button 
              type="button"
              onClick={downloadCommissionerBriefPDF}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="ri-file-chart-line"></i> Download Data Brief (PDF)
            </button>
          ) : (
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1e3040] p-2.5 rounded-lg flex items-center justify-center gap-2">
              <i className="ri-pulse-line"></i> {areaIssuesCount} related reports detected nearby
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

 {/* Comments Section */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 md:p-5"id="comments">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 <i className="ri-chat-3-fill text-[#0f766e]"></i> Discussion ({issue.commentCount})
 </h3>
 
 <CommentList 
 comments={comments} 
 issue={issue} 
 onCommentUpdated={handleCommentUpdated} 
 onCommentAdded={handleCommentAdded} 
 onCommentDeleted={handleCommentDeleted}
 />

 {issue.approvalStatus ==='approved'? (
 <div className="mt-8 border-t border-slate-100 pt-6">
 <CommentBox issueId={issue._id} onCommentAdded={handleCommentAdded} />
 </div>
 ) : (
 <div className="mt-8 border-t border-slate-100 pt-6 text-center">
 <p className="text-slate-500 dark:text-slate-300 font-medium text-[13px] flex items-center justify-center gap-2">
 <i className="ri-lock-fill text-[13px]"></i>
 Comments are disabled until this post is approved by an administrator.
 </p>
 </div>
 )}
 </div>
 </motion.div>

 {/* Action Sidebar */}
 <motion.div 
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-5">
 {/* Crowdfunding Widget */}
 {issue.crowdfunding?.enabled && (
 <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 
 <div className="text-center mb-5 relative z-10">
 <div className="w-14 h-14 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-100">
 <i className="ri-hand-coin-fill text-2xl tracking-tight"></i>
 </div>
 <h3 className="font-bold text-[13px] tracking-tight text-emerald-900 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>Community Fund</h3>
 <p className="text-xs font-medium text-emerald-700/80 mt-1">{issue.crowdfunding.purpose}</p>
 </div>
 
 <div className="my-6 relative z-10">
 <div className="flex justify-between items-end mb-2">
 <div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 block mb-1">Raised</span>
 <span className="text-2xl tracking-tight font-bold text-emerald-800">৳{issue.crowdfunding.raised}</span>
 </div>
 <div className="text-right">
 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 block mb-1">Goal</span>
 <span className="text-[13px] font-bold text-emerald-900/50">৳{issue.crowdfunding.goal}</span>
 </div>
 </div>
 <div className="w-full bg-emerald-200/50 rounded-full h-2.5 overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width:`${Math.min(((issue.crowdfunding.raisedAmount || issue.crowdfunding.raised || 0) / Math.max(issue.crowdfunding.targetAmount || issue.crowdfunding.goal || 1, 1)) * 100, 100)}%`}}
 transition={{ duration: 1, ease:"easeOut"}}
 className="bg-emerald-500 h-full rounded-full relative">
 </motion.div>
 </div>
 </div>

 <button 
 onClick={() => setIsModalOpen(true)}
 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] py-3.5 rounded-xl shadow-sm shadow-emerald-600/20 transition-all relative z-10 flex items-center justify-center gap-2">
 <i className="ri-heart-3-fill"></i> Contribute Now
 </button>
 </div>
 )}

 {/* State 1: Claimable */}
 {isClaimable && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-teal-200 shadow-sm relative overflow-hidden">
 <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
 <i className="ri-tools-line text-[13px] tracking-tight"></i>
 </div>
 <h3 className="font-bold text-[13px] text-slate-900 dark:text-white mb-1 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>Take Action</h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-4 leading-relaxed">
 Be the hero. Claim this issue, resolve the problem in your community, and earn rewards and reputation.
 </p>
 <button onClick={handleClaim} disabled={claiming}
 className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-[13px]">
 {claiming ? <MinimalLoader /> : <><i className="ri-hand-sanitizer-fill"></i> Claim Issue</>}
 </button>
 </div>
 )}

 {/* State 2: Assigned */}
 {isAssigned && !isClaimer && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
 <i className="ri-user-settings-fill text-[13px]"></i>
 </div>
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white mb-0.5 text-[13px]">Under Resolution</h4>
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Currently assigned to <span className="font-bold text-blue-600">{issue.assignedTo.name}</span></p>
 {issue.assignedTo.deadline && (
 <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 text-slate-500 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
 <i className="ri-timer-line"></i> Due {new Date(issue.assignedTo.deadline).toLocaleDateString()}
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* State 3: Current User is Claimer */}
 {isClaimer && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
 <div className="bg-emerald-50/50 p-5">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
 <i className="ri-verified-badge-fill"></i> Your Task
 </div>
 <h3 className="font-bold text-[13px] text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>Resolution Center</h3>
 </div>
 <button onClick={handleUnclaim} className="w-8 h-8 rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-100 text-red-500 hover:bg-red-50 hover:border-red-100 hover:text-red-600 flex items-center justify-center shadow-sm transition-colors text-[13px]"title="Step down">
 <i className="ri-close-line"></i>
 </button>
 </div>
 <ResolutionProofPanel issue={issue} onProofUploaded={handleProofUploaded} />
 </div>
 </div>
 )}

 {/* State 4: Other Resolver's Proof & Verification */}
 {(!isClaimer && issue.resolutionProofs?.length > 0) && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden">
 <div className="p-5 border-b border-slate-100">
 <h3 className="font-bold text-[13px] text-slate-900 dark:text-white mb-0.5 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>Submitted Proofs</h3>
 <p className="text-[11px] font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">The assigned member provided proof</p>
 </div>
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50 p-3">
 <ResolutionProofPanel issue={issue} onProofUploaded={handleProofUploaded} />
 </div>
 </div>
 )}

 {/* State 5: Verification Required */}
 {issue.resolutionProofs?.length > 0 && issue.status !=='solved'&& (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 
 <h3 className="font-bold text-[13px] mb-1.5 flex items-center gap-2 text-amber-900 relative z-10 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 <i className="ri-shield-check-fill text-amber-500"></i> Verify Fix
 </h3>
 <p className="text-amber-700/80 mb-5 text-xs font-medium leading-relaxed relative z-10">
 We need 3 community members to verify the fix before closing this issue.
 </p>
 
 <div className="mb-5 relative z-10 bg-amber-50 rounded-xl p-3 border border-amber-100/50">
 <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-2">
 <span>Progress</span>
 <span>{issue.verifications?.length || 0} / 3</span>
 </div>
 <div className="w-full bg-amber-100 rounded-full h-1.5">
 <div className="bg-amber-500 h-full rounded-full transition-all duration-500"style={{ width:`${Math.min(((issue.verifications?.length || 0) / 3) * 100, 100)}%`}}></div>
 </div>
 </div>

 <div className="relative z-10">
 {!issue.verifications?.includes(user?.uid) ? (
 <button 
 onClick={handleVerifyResolution}
 className="w-full py-2.5 bg-amber-500 text-white hover:bg-amber-600 font-bold text-[13px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
 <i className="ri-check-double-line"></i> Verify Now
 </button>
 ) : (
 <div className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-600 font-bold text-[13px] rounded-xl flex items-center justify-center gap-2">
 <i className="ri-checkbox-circle-fill"></i> Verified
 </div>
 )}
 </div>
 </div>
 )}

 {/* Share Widget */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm text-center">
 <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-[10px] uppercase tracking-widest">Share issues across platforms</h4>
 <div className="flex justify-center gap-4">
 <button className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-black hover:border-black hover:text-white transition-colors text-slate-500 dark:text-slate-300 shadow-sm"><i className="ri-twitter-x-line text-[13px]"></i></button>
 <button className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-[#4267B2] hover:border-[#4267B2] hover:text-white transition-colors text-slate-500 dark:text-slate-300 shadow-sm"><i className="ri-facebook-fill text-[13px]"></i></button>
 <button className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-colors text-slate-500 dark:text-slate-300 shadow-sm"><i className="ri-whatsapp-line text-[13px]"></i></button>
 </div>
 </div>
 </motion.div>
 </div>

 <ContributionModal 
 issueId={issue._id} 
 isOpen={isModalOpen} 
 onClose={() => setIsModalOpen(false)} 
 onContributeSuccess={handleContributeSuccess}
 />

 {/* Generated Letter Modal */}
 {letterModalOpen && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
 <div className="p-5 bg-blue-600 text-white flex justify-between items-center">
 <div>
 <h3 className="text-[13px] tracking-tight font-bold tracking-tight">Official Complaint Letter</h3>
 <p className="text-blue-100 text-xs mt-1">AI generated formal complaint letter for escalations</p>
 </div>
 <button 
 type="button"onClick={() => setLetterModalOpen(false)}
 className="p-1.5 hover:bg-blue-700 rounded-lg text-white transition-colors">
 <i className="ri-close-line text-lg tracking-tight"></i>
 </button>
 </div>
 <div className="p-4 space-y-4">
 <div className="max-h-[380px] overflow-y-auto p-4 bg-slate-50 dark:bg-[#0b1215] rounded-xl border border-slate-200 dark:border-[#1e3040] text-slate-800 dark:text-white font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
 {generatedLetter}
 </div>
 <div className="pt-2 flex gap-3 justify-end">
 <button 
 type="button"onClick={() => setLetterModalOpen(false)}
 className="px-5 py-2.5 bg-slate-100 dark:bg-[#1e3040] hover:bg-slate-250 text-slate-700 dark:text-[#cbd5e1] font-bold rounded-xl text-[13px] transition-colors">
 Cancel
 </button>
 <button 
 type="button"onClick={downloadLetterPDF}
 className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[13px] transition-all shadow-md flex items-center gap-1.5">
 <i className="ri-download-2-line"></i> Download PDF
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}

 {/* QR Poster Generator Modal */}
 {qrModalOpen && (
   <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
     <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-[#1e3040]">
       
       <div className="p-5 bg-teal-700 text-white flex justify-between items-center">
         <div>
           <h3 className="text-sm font-bold text-white">Physical QR Sticker Generator</h3>
           <p className="text-teal-100 text-xs mt-1">Generate a printable poster to place at the physical location</p>
         </div>
         <button 
           type="button" onClick={() => setQrModalOpen(false)}
           className="p-1.5 hover:bg-teal-800 rounded-lg text-white transition-colors cursor-pointer">
           <i className="ri-close-line text-lg tracking-tight"></i>
         </button>
       </div>
       
       <div className="p-5 space-y-5">
         {/* Live Preview Card */}
         <div className="border border-slate-200 dark:border-[#1e3040] rounded-xl p-4 bg-slate-50 dark:bg-[#0b1215]/50 flex flex-col items-center text-center">
           <div className="text-xs font-bold text-teal-800 dark:text-teal-400 mb-1">CivicNest Community Sticker</div>
           <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">Print layout preview</div>
           
           <div className="bg-white p-5 rounded-xl shadow-md border-2 border-teal-600 max-w-[260px] w-full text-slate-905">
             <div className="text-[11px] font-extrabold text-teal-700 uppercase tracking-widest">CivicNest Report</div>
             <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-3">Community cleanliness portal</div>
             
             <div className="w-40 h-40 bg-slate-100 mx-auto rounded-lg flex items-center justify-center overflow-hidden border border-slate-250">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.href)}`} 
                 alt="QR Code Preview" 
                 className="w-full h-full object-contain"
               />
             </div>
             
             <div className="font-bold text-xs text-slate-800 mt-3 truncate">{issue.title}</div>
             <div className="text-[10px] text-slate-550 mt-0.5">Location: {issue.area}</div>
             
             <div className="mt-3 bg-teal-50 text-teal-700 text-[10px] font-bold py-1.5 px-2 rounded-lg">
               Scan to report or check status
             </div>
           </div>
         </div>
         
         <div className="flex gap-3 justify-end">
           <button 
             type="button" onClick={() => setQrModalOpen(false)}
             className="px-5 py-2.5 bg-slate-100 dark:bg-[#1e3040] hover:bg-slate-250 text-slate-700 dark:text-[#cbd5e1] font-bold rounded-xl text-[13px] transition-colors cursor-pointer">
             Cancel
           </button>
           <button 
             type="button" onClick={handlePrintQR}
             className="px-6 py-2.5 bg-[#40826D] hover:bg-[#326756] text-white font-bold rounded-xl text-[13px] transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
             <i className="ri-printer-line"></i> Print Poster
           </button>
         </div>
       </div>
     </motion.div>
   </div>
 )}
 </div>
 );
};

export default IssueDetails;
