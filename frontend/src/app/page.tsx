/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Volume2,
  Calendar,
  MapPin,
  Users,
  
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Bell,
  Navigation,
  Car,
  Shield,
  Accessibility,
  Bus,
  Award,
  QrCode,
  CreditCard,
  X,
  Share2,
  Download,
  Smartphone,
  Maximize2,
  Radio,
  Music,
  Star,
  Zap,
  Phone,
  KeyRound,
  User,
  LogOut,
  Utensils,
  
  ShieldCheck,
  CheckCircle,
  Info,
} from "lucide-react";

interface BookedPass {
  id: string;
  passType: "general" | "season" | "vip";
  title: string;
  date: string;
  quantity: number;
  holder: string;
  phone: string;
  totalAmount: number;
  gate: string;
  qrId: string;
  bookedAt: string;
}

export const TICKET_TIERS = {
  general: {
    id: "general",
    label: "Single",
    passTypeUI: "Single Pass",
    pdfTitle: "Single Pass",
    persons: 1,
    price: 149,
    originalPrice: 249,
    discountText: "Save ₹100",
  },
  season: {
    id: "season",
    label: "Couple",
    passTypeUI: "Couple Pass",
    pdfTitle: "Couple Pass",
    persons: 2,
    price: 249,
    originalPrice: 298,
    discountText: "Save ₹49",
  },
  vip: {
    id: "vip",
    label: "Family",
    passTypeUI: "Family (4+1) Pass",
    pdfTitle: "Family Pass",
    persons: 5,
    price: 499,
    originalPrice: 745,
    discountText: "Save ₹246",
  }
};
export default function Home() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<"discover" | "experience" | "passes" | "venue" | "my-pass">("discover");
  const [viewMode, setViewMode] = useState<"mobile-frame" | "expanded">("mobile-frame");

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Google Sheets Fetch State
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwt3p2lpvP8k-BC7WeYtsTilwpZhKxCcWX2wmx2q32lA5oBRNQ_MlVmh-E4v9qQHWXNfg/exec";

  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string } | null>(null);
  const [userLocation, setUserLocation] = useState<string>("Unknown Location");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState(["", "", "", ""]);
  const [nameInput, setNameInput] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // City & Notifications
  const selectedCity = "Ballia, Begusarai";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Ticket Quantities (Homepage quick counter)
  const [qtyGeneral, setQtyGeneral] = useState(1);
  const [qtySeason, setQtySeason] = useState(1);
  const [qtyVip, setQtyVip] = useState(1);
  
  const [selectedPassType, setSelectedPassType] = useState<"general" | "season" | "vip">("general");

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Booking Flow Window State
  const [isBookingWindowOpen, setIsBookingWindowOpen] = useState(false);
  const [bookingPassType, setBookingPassType] = useState<"general" | "season" | "vip">("general");
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingDate, setBookingDate] = useState("16 Oct 2026 (Event Night)");
  const [addOnDandiya1, setAddOnDandiya1] = useState(false);
  const [addOnDandiya2, setAddOnDandiya2] = useState(false);
  const [addOnDandiya3, setAddOnDandiya3] = useState(false);
  const [addOnDandiya4, setAddOnDandiya4] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"gpay" | "phonepe" | "paytm" | "card">("gpay");
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [lastBookedPass, setLastBookedPass] = useState<BookedPass | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Booked Tickets Collection
  const [bookedPasses, setBookedPasses] = useState<BookedPass[]>([]);

  // Fetch user location silently on mount
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.city && data.country_name) {
          setUserLocation(`${data.city}, ${data.country_name}`);
        } else if (data.city) {
          setUserLocation(data.city);
        }
      })
      .catch((err) => console.error("Failed to fetch location silently:", err));
  }, []);

  // OTP Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === "otp" && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [authStep, otpTimer]);

  // Fetch Tickets from Google Sheets
  const fetchUserTickets = async (phone: string) => {
    setIsFetchingTickets(true);
    try {
      const formattedPhone = phone.replace(/^\+91\s*/, '').trim();
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?phone=${encodeURIComponent(formattedPhone)}`);
      const data = await response.json();
      
      if (data.status === "success" && data.tickets) {
        const passes: BookedPass[] = data.tickets.map((t: any) => {
           const typeStr = (t.ticketType || "").toLowerCase();
           let pType = "general";
           if (typeStr.includes("season")) pType = "season";
           if (typeStr.includes("vip")) pType = "vip";
           
           return {
             id: String(t.ticketId),
             passType: pType,
             title: t.ticketType,
             date: t.issuedAt,
             quantity: Number(t.quantity) || 1,
             holder: t.name,
             phone: String(t.number).replace(/^'/, ''),
             totalAmount: Number(String(t.paymentStatus).replace(/\D/g, '')) || 0,
             gate: pType === "vip" ? "Gate 01 • VIP Lounge" : "Gate 03 • Amphitheatre",
             qrId: `${t.ticketId}-${String(t.name).toUpperCase().replace(/\s/g, "")}`,
             bookedAt: t.issuedAt
           };
        });
        setBookedPasses(passes);
        return passes;
      }
    } catch (err) {
      console.error("Failed to fetch user tickets:", err);
    } finally {
      setIsFetchingTickets(false);
    }
    return [];
  };

  // Hydrate user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("rn_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.phone) {
          setCurrentUser(parsedUser);
          setIsLoggedIn(true);
          fetchUserTickets(parsedUser.phone);
        }
      } catch (err) {
        console.error("Failed to parse stored user", err);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculations for Homepage sticky dock
  const totalTickets = selectedPassType === "general" ? qtyGeneral : selectedPassType === "season" ? qtySeason : qtyVip;
  const totalPrice = selectedPassType === "general" ? qtyGeneral * TICKET_TIERS.general.price : selectedPassType === "season" ? qtySeason * TICKET_TIERS.season.price : qtyVip * TICKET_TIERS.vip.price;

  // Booking Price Calculations
  const basePassPrice = TICKET_TIERS[bookingPassType].price;
  const dandiya1Cost = addOnDandiya1 ? 99 * bookingQty : 0;
  const dandiya2Cost = addOnDandiya2 ? 199 * bookingQty : 0;
  const dandiya3Cost = addOnDandiya3 ? 299 * bookingQty : 0;
  const dandiya4Cost = addOnDandiya4 ? 399 * bookingQty : 0;
  const bookingTotal = basePassPrice * bookingQty + dandiya1Cost + dandiya2Cost + dandiya3Cost + dandiya4Cost;

  const handleUpdateQty = (type: "general" | "season" | "vip", delta: number) => {
    if (type === "general") setQtyGeneral((prev) => Math.max(0, prev + delta));
    if (type === "season") setQtySeason((prev) => Math.max(0, prev + delta));
    if (type === "vip") setQtyVip((prev) => Math.max(0, prev + delta));
  };

  // Trigger Booking Flow (Auth Gate)
  const handleInitiateBooking = (type: "general" | "season" | "vip") => {
    setBookingPassType(type);
    const initialQty = type === "general" ? qtyGeneral || 1 : type === "season" ? qtySeason || 1 : qtyVip || 1;
    setBookingQty(initialQty);
    setIsBookingSuccess(false);

    if (!isLoggedIn) {
      // Prompt user to login with phone number & OTP first
      setAuthStep("phone");
      setIsAuthModalOpen(true);
    } else {
      // Already logged in -> open booking window directly
      setIsBookingWindowOpen(true);
    }
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length >= 10) {
      setAuthStep("otp");
      setOtpTimer(30);
      setOtpInput(["1", "0", "8", "9"]); // Pre-fill test OTP
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpInput.join("");
    if (enteredOtp.length === 4) {
      // Auto-check if returning user by fetching their tickets
      const existingTickets = await fetchUserTickets(phoneInput);
      
      if (existingTickets && existingTickets.length > 0) {
        // They have tickets! Log them in automatically with the name on their ticket
        completeAuth(existingTickets[0].holder, true);
      } else {
        // First-time user (no tickets), ask for name
        if (!nameInput && !currentUser?.name) {
          setAuthStep("profile");
        } else {
          completeAuth(nameInput || currentUser?.name || "Aman Kumar", true);
        }
      }
    }
  };

  const completeAuth = (name: string, skipFetch: boolean = false) => {
    const userObj = {
      name: name.trim() || "Aman Kumar",
      phone: phoneInput || "98765 43210",
    };
    setCurrentUser(userObj);
    setIsLoggedIn(true);
    localStorage.setItem("rn_user", JSON.stringify(userObj));
    setIsAuthModalOpen(false);
    // Proceed directly to the pass booking window
    setIsBookingWindowOpen(true);
    
    // Fetch user's existing tickets from Google Sheets
    if (phoneInput && !skipFetch) {
      fetchUserTickets(phoneInput);
    }
  };

  // Handle Confirm Booking & Payment
  const handleConfirmBooking = async () => {
    const newPassId = `RN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const passTitle =
      bookingPassType === "general"
        ? "Single Pass"
        : bookingPassType === "season"
        ? "Couple Pass"
        : "Family (4+1) Pass";

    const newPass: BookedPass = {
      id: newPassId,
      passType: bookingPassType,
      title: passTitle,
      date: "13 Oct 2026 (Event Night)",
      quantity: bookingQty,
      holder: currentUser?.name || "Aman Kumar",
      phone: currentUser?.phone || "+91 98765 43210",
      totalAmount: bookingTotal,
      gate: bookingPassType === "vip" ? "Gate 01 • Royal VIP Pavilion" : "Gate 03 • Amphitheatre",
      qrId: `${newPassId}-${currentUser?.name?.toUpperCase().replace(/\s+/g, "") || "USER"}`,
      bookedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    // Google Sheets Webhook Integration
    try {
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: newPass.id.slice(-4), // Only send the last 4 digits
          bookingId: newPass.qrId,
          ticketStatus: "Active",
          issuedAt: newPass.bookedAt,
          ticketType: newPass.title,
          name: newPass.holder,
          number: `'${newPass.phone.replace(/^\+91\s*/, '')}`, // Remove +91 and prepend single quote
          address: userLocation, // Send fetched location
          emergencyContact: "N/A",
          quantity: newPass.quantity,
          paymentStatus: `Paid (₹${newPass.totalAmount})`
        }),
      });
    } catch (error) {
      console.error("Failed to sync booking to Google Sheets:", error);
    }

    setBookedPasses((prev) => [newPass, ...prev]);
    setLastBookedPass(newPass);
    setIsBookingSuccess(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setBookedPasses([]); // clear tickets on logout
    localStorage.removeItem("rn_user");
    setIsProfileDrawerOpen(false);
  };

  const handleDownloadPdf = async (passId: string) => {
    try {
      setIsDownloading(passId);
      const { jsPDF } = await import("jspdf");
      
      const pass = bookedPasses.find(p => p.id === passId);
      if (!pass) return;

      // Create a native vector PDF (A4 size)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Background Image & QR Code Fetch
      const bgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAiiL9Dh7097OXfZzOov9Ju4bylaiFmUCUAaQVNo-fZhLahRZ9YfeuunsOKyh-ioFV7IVh9d0N_9kTRtbDLbhCgyB5unzLQ1qt4iorSSM7wrZPcojda52OGYgvB68NHJkAeifoUZEGqt3thd2ZPFTLkKPwEFTaQV_uSu1PCM5_srUEHrM2HT50HU5n_xO8wM-xMrbFjNVp6RZznDnHfNUJlHcpmH0PjjXKOx25OmC0PaoAl9bLc6seWNg";
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(pass.qrId || "RAAS-NIRVANA-2026")}&size=200`;
      
      const readAsDataURL = (url: string) => fetch(url)
        .then(res => res.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        })).catch(() => null);

      const [bgBase64, qrBase64] = await Promise.all([readAsDataURL(bgUrl), readAsDataURL(qrUrl)]);

      // Draw Background
      if (bgBase64) {
        pdf.addImage(bgBase64, "JPEG", 0, 0, 595.28, 841.89);
        pdf.setFillColor(28, 15, 24);
        if (typeof (pdf as any).GState !== "undefined") {
          const gState = new (pdf as any).GState({ opacity: 0.88 });
          (pdf as any).setGState(gState);
          pdf.rect(0, 0, 595.28, 841.89, "F");
          const normalState = new (pdf as any).GState({ opacity: 1.0 });
          (pdf as any).setGState(normalState);
        }
      } else {
        pdf.setFillColor(28, 15, 24);
        pdf.rect(0, 0, 595.28, 841.89, "F");
      }
      
      // Header border
      pdf.setDrawColor(240, 191, 92); // #f0bf5c
      pdf.setLineWidth(2);
      pdf.line(40, 80, 555, 80);

      // Title & Header
      pdf.setTextColor(240, 191, 92);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("OFFICIAL E-TICKET", 40, 60);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text("CHHOTI BALLIA DANDIYA NIGHTS", 40, 115);
      
      pdf.setFontSize(12);
      pdf.setTextColor(221, 193, 177); // #ddc1b1
      pdf.text(`OCT 13, 2026 • 7:00 PM`, 40, 140);
      pdf.setFontSize(10);
      pdf.setTextColor(165, 140, 125);
      pdf.text("Venue: Chhoti Ballia, Begusarai", 40, 155);

      // Ticket ID pill
      pdf.setDrawColor(232, 121, 32); // #e87920
      pdf.setFillColor(41, 27, 36);
      pdf.roundedRect(420, 95, 135, 25, 12.5, 12.5, "FD");
      pdf.setTextColor(255, 182, 136);
      pdf.setFontSize(10);
      pdf.text(`ID: ${pass.id.slice(-4)}`, 440, 112);

      // Draw QR Code
      if (qrBase64) {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(385, 150, 170, 170, 15, 15, "F");
        pdf.addImage(qrBase64, "PNG", 395, 160, 150, 150);
      }

      // Details Grid (Left of QR Code)
      pdf.setFillColor(37, 24, 32); // #251820
      pdf.roundedRect(40, 185, 320, 135, 10, 10, "F");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(165, 140, 125); // #a58c7d
      pdf.text("TICKET HOLDER", 60, 210);
      pdf.text("PHONE NUMBER", 230, 210);
      
      pdf.setFontSize(13);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      const holderName = pass.holder.length > 20 ? pass.holder.substring(0, 18) + '...' : pass.holder;
      pdf.text(holderName.toUpperCase(), 60, 228);
      pdf.text(pass.phone.replace(/^\+91\s*/, ''), 230, 228);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(165, 140, 125);
      pdf.text("QUANTITY", 60, 265);
      pdf.text("TOTAL PAID", 150, 265);
      pdf.text("PASS TYPE", 230, 265);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${pass.quantity} Person(s)`, 60, 283);
      pdf.setTextColor(240, 191, 92);
      pdf.text(`INR ${pass.totalAmount.toLocaleString("en-IN")}`, 150, 283);
      
      const passTypeName = TICKET_TIERS[pass.passType].pdfTitle;
      pdf.setTextColor(255, 255, 255);
      pdf.text(passTypeName.toUpperCase(), 230, 283);

      // Description
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(221, 193, 177);
      const descText = "Experience the ultimate Dandiya night filled with vibrant music, traditional dance, and unforgettable memories at Chhoti Ballia's premier festive celebration.";
      pdf.text(descText, 40, 350, { maxWidth: 515, lineHeightFactor: 1.5 });

      // Perforation line
      pdf.setDrawColor(86, 67, 55); // #564337
      pdf.setLineWidth(1);
      pdf.setLineDashPattern([5, 5], 0);
      pdf.line(40, 410, 555, 410);
      pdf.setLineDashPattern([], 0);

      // Left Column: Things to know
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(240, 191, 92);
      pdf.text("Things to know", 40, 445);

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(255, 255, 255);

      const rules = [
        "• Entry allowed for all ages",
        "• Valid ID required for entry",
        "• Traditional Indian dress code",
        "• Re-entry is not allowed",
        "• Pets and outside food prohibited",
        "• No alcohol or smoking on premises",
        "• Maintain peace and decorum"
      ];

      let yPos = 465;
      rules.forEach(rule => {
        pdf.text(rule, 40, yPos);
        yPos += 18;
      });

      // Right Column: Facilities
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(240, 191, 92);
      pdf.text("Facilities at the event", 300, 445);

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(255, 255, 255);

      const facilities = [
        ["• Free parking available", "  Two-wheelers and four-wheelers"],
        ["• Food stalls inside", "  Pure Veg only"],
        ["• Basic medical support", "  First-aid on site"],
        ["• Washrooms available", "  Separate for male/female"],
        ["• Open ground venue", "  Standing and dancing area"]
      ];

      let fyPos = 465;
      facilities.forEach(fac => {
        pdf.setTextColor(255, 255, 255);
        pdf.text(fac[0], 300, fyPos);
        if (fac[1]) {
          fyPos += 12;
          pdf.setTextColor(165, 140, 125);
          pdf.setFontSize(7.5);
          pdf.text(fac[1], 300, fyPos);
          pdf.setFontSize(8.5);
        }
        fyPos += 18;
      });

      // Footer
      pdf.setFillColor(240, 191, 92);
      pdf.rect(0, 800, 595.28, 42, "F");
      pdf.setTextColor(28, 15, 24);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("CHHOTI BALLIA DANDIYA NIGHTS • VALID FOR ONE SCAN ONLY", 297, 825, { align: "center" });

      pdf.save(`${pass.id}-Ticket.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#120910] text-[#f4dce8] flex flex-col items-center justify-start py-0 md:py-6 px-0 md:px-4 font-sans selection:bg-[#e87920] selection:text-white">
      {/* Top Viewport Mode Switcher (Visible on desktop for inspection) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-[430px] mb-3 px-3 py-1.5 rounded-full bg-[#251820]/90 border border-[#403039] backdrop-blur-md shadow-lg text-xs">
        <div className="flex items-center gap-2 text-[#ffb688] font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Raas Nirvana 2026</span>
        </div>
        <div className="flex items-center gap-1 bg-[#160a12] p-0.5 rounded-full border border-[#403039]/50">
          <button
            onClick={() => setViewMode("mobile-frame")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              viewMode === "mobile-frame" ? "bg-[#e87920] text-white shadow-sm" : "text-[#ddc1b1] hover:text-white"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile Frame</span>
          </button>
          <button
            onClick={() => setViewMode("expanded")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              viewMode === "expanded" ? "bg-[#e87920] text-white shadow-sm" : "text-[#ddc1b1] hover:text-white"
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full Width</span>
          </button>
        </div>
      </div>

      {/* Main Container / Mobile App Shell */}
      <div
        className={`w-full transition-all duration-300 relative bg-[#1c0f18] text-[#f4dce8] flex flex-col ${
          viewMode === "mobile-frame"
            ? "min-h-screen md:max-w-[430px] md:rounded-[44px] md:shadow-[0_25px_70px_rgba(0,0,0,0.85)] md:border-[8px] md:border-[#2b1b24] md:overflow-hidden md:h-[880px] md:max-h-[880px]"
            : "max-w-3xl md:rounded-3xl shadow-2xl overflow-hidden min-h-screen"
        }`}
      >

        {/* APP HEADER */}
        <header className="sticky top-0 inset-x-0 z-40 bg-[#160a12]/90 backdrop-blur-xl border-b border-[#403039]/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <div className="h-16 px-4 flex items-center justify-between gap-2">
            {/* Left: Avatar & Account Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              className="flex items-center gap-2.5 min-w-0 flex-shrink-0 cursor-pointer group text-left bg-transparent border-0 p-0 select-none touch-manipulation"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#f0bf5c]/80 shadow-md pointer-events-none">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1VNLRMqeNF4RRfzbVQgQx53ttKdclUdDNZYlIS2nRtvQ9EQEFWQYntmoZ6Z-iHNm5YbmvZJgBncxTeD6ZoC52VA5OJNhVcCdSbtcRVK8iUDQcBfVSh2s1-Kcnuveu1zEI-hCq-WTJ2gPuJhlmO38dH7M5EAfAbP__YlBOtMEt-PAXnu7TJs2J7fln3ElatljyRCZXXy3q_4AJKmkvC71T-SozTmEDTAEQ1H8kI_Z_n-vxKRW_8yMddCq38j"
                  alt="Raas Nirvana Festival Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/festive_avatar.jpg";
                  }}
                />
                {isLoggedIn && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-black"></span>
                )}
              </div>
              <div className="flex flex-col min-w-0 pointer-events-none">
                <span className="font-serif font-bold text-sm tracking-wider text-[#ffb688] truncate leading-none group-hover:text-white transition-colors">
                  {isLoggedIn ? currentUser?.name || "Aman Kumar" : "RAAS NIRVANA"}
                </span>
                <span className="text-[10px] font-bold text-[#f0bf5c] uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                  {isLoggedIn ? "Pass Holder • Profile ▾" : "NAVRATRI 2026 ▾"}
                </span>
              </div>
            </button>

            {/* Right: Notification Bell */}
            <div className="flex items-center gap-1.5 flex-shrink-0 relative">
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#34262f]/60 border border-[#403039] text-[#f4dce8] hover:text-[#ffb688] transition-colors relative cursor-pointer touch-manipulation"
              >
                <Bell className="w-4 h-4 pointer-events-none" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#e87920] animate-pulse pointer-events-none"></span>
              </button>
            </div>
          </div>
        </header>

        {/* NOTIFICATIONS DRAWER POPUP */}
        {isNotificationOpen && (
          <>
            {/* Invisible overlay to catch clicks outside */}
            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
            
            <div className="absolute top-[72px] left-4 right-4 z-50 rounded-2xl bg-[#291b24]/95 backdrop-blur-xl border border-[#403039] shadow-[0_15px_35px_rgba(0,0,0,0.5)] text-xs space-y-2 p-4 animate-in slide-in-from-top-4 fade-in duration-200">
              <div className="flex items-center justify-between text-[#f0bf5c] font-bold pb-2 border-b border-[#403039]/60">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 pointer-events-none" /> Live Festival Alerts
                </span>
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-[#a58c7d] hover:text-white cursor-pointer touch-manipulation active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
              <div className="flex flex-col gap-2.5 mt-2">
                <div className="p-3 rounded-xl bg-[#34262f]/80 border border-[#403039] flex items-start gap-3 transition-colors hover:bg-[#34262f]">
                  <div className="w-8 h-8 rounded-full bg-[#7c2a38]/30 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#e87920]" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-[13px]">Season Passes 85% Sold Out</p>
                    <p className="text-[11px] text-[#ddc1b1] mt-0.5 leading-relaxed">
                      Reserved VIP baithak allocation for Day 1 & Day 9 nearly exhausted.
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#34262f]/80 border border-[#403039] flex items-start gap-3 transition-colors hover:bg-[#34262f]">
                  <div className="w-8 h-8 rounded-full bg-[#bc9032]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#f0bf5c]" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-[13px]">Dress Code Reminder</p>
                    <p className="text-[11px] text-[#ddc1b1] mt-0.5 leading-relaxed">Authentic traditional Gujarati attire mandatory at Gate 03 entry.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full overflow-x-hidden md:overflow-y-auto pb-36 no-scrollbar">
          {/* TAB 1: DISCOVER (Primary Full Festival Flow) */}
          {activeTab === "discover" && (
            <div className="flex flex-col w-full">
              {/* HERO SECTION */}
              <section className="relative w-full overflow-hidden">
                {/* Cinematic Visual Anchor Image */}
                <div className="relative w-full h-[470px]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiiL9Dh7097OXfZzOov9Ju4bylaiFmUCUAaQVNo-fZhLahRZ9YfeuunsOKyh-ioFV7IVh9d0N_9kTRtbDLbhCgyB5unzLQ1qt4iorSSM7wrZPcojda52OGYgvB68NHJkAeifoUZEGqt3thd2ZPFTLkKPwEFTaQV_uSu1PCM5_srUEHrM2HT50HU5n_xO8wM-xMrbFjNVp6RZznDnHfNUJlHcpmH0PjjXKOx25OmC0PaoAl9bLc6seWNg"
                    alt="Grand Navratri Raas circle dancers spinning in mirrorwork chaniya cholis"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/garba_featured.jpg";
                    }}
                  />
                  {/* Atmospheric Gradients with pointer-events-none */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c0f18] via-[#1c0f18]/60 to-transparent pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#160a12]/80 via-transparent to-[#1c0f18] pointer-events-none"></div>

                  {/* Top Badges Overlay */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#403039]/85 backdrop-blur-md text-[#f0bf5c] text-[11px] font-bold uppercase tracking-wider shadow-sm border border-[#f0bf5c]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e87920] animate-ping"></span>
                      OCTOBER 16, 2026
                    </span>
                  </div>

                  {/* Hero Copy (Anchored at bottom of hero) */}
                  <div className="absolute bottom-4 inset-x-4 flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f0bf5c]">
                      Dandiya Night • {selectedCity}
                    </span>
                    <h1 className="font-serif text-3xl font-bold text-[#f4dce8] leading-tight drop-shadow-md">
                      A Night That Moves With You.
                    </h1>
                    <p className="text-xs text-[#ddc1b1] line-clamp-2 max-w-[340px] leading-relaxed">
                      Gujarat&apos;s celebrated heritage arena transforms into an acoustic sanctum of organic Garba,
                      folk-fusion orchestras, and midnight culinary art.
                    </p>
                  </div>
                </div>

                {/* Quick Metadata Pill Row */}
                <div className="px-4 pt-2 pb-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34262f] text-[#f4dce8] whitespace-nowrap shadow-sm border border-[#403039]">
                    <Calendar className="w-3.5 h-3.5 text-[#f0bf5c]" />
                    <span className="text-xs font-medium">16 OCT • 7:00 PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34262f] text-[#f4dce8] whitespace-nowrap shadow-sm border border-[#403039]">
                    <MapPin className="w-3.5 h-3.5 text-[#ffb688]" />
                    <span className="text-xs font-medium">Chhoti Ballia, Begusarai</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34262f] text-[#f4dce8] whitespace-nowrap shadow-sm border border-[#403039]">
                    <Users className="w-3.5 h-3.5 text-[#ffb2b9]" />
                    <span className="text-xs font-medium">3,500 Revelers / Night</span>
                  </div>
                </div>


              </section>

              {/* QUICK EVENT FACTS STRIP */}
              <section className="px-4 py-2 w-full">
                <div className="grid grid-cols-4 gap-2 bg-[#251820] rounded-2xl p-3 border border-[#403039]/60 shadow-inner">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-extrabold text-[#f0bf5c] leading-tight">1</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#ddc1b1] mt-0.5">Night</span>
                    <span className="text-[9px] text-[#a58c7d] leading-tight">Consecutive</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-extrabold text-[#ffb688] leading-tight">3</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#ddc1b1] mt-0.5">Stages</span>
                    <span className="text-[9px] text-[#a58c7d] leading-tight">Acoustic</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-extrabold text-[#ffb2b9] leading-tight">40+</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#ddc1b1] mt-0.5">Artists</span>
                    <span className="text-[9px] text-[#a58c7d] leading-tight">Folk Maestros</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-extrabold text-[#ffdea4] leading-tight">100%</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#ddc1b1] mt-0.5">Organic</span>
                    <span className="text-[9px] text-[#a58c7d] leading-tight">Live Beats</span>
                  </div>
                </div>
              </section>

              {/* BESPOKE ARCHITECTURAL CATEGORY NAVIGATION (THE FESTIVAL REALMS) */}
              <section className="py-6 w-full flex flex-col gap-3">
                <div className="px-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                      Curated Arenas
                    </span>
                    <h2 className="font-serif text-lg text-[#f4dce8] font-semibold">The Festival Realms</h2>
                  </div>
                  <span className="text-xs text-[#e87920] font-bold tracking-wider uppercase">Swipe ›</span>
                </div>

                {/* Horizontal Arena Slider */}
                <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar py-1">
                  {/* Card 1: Traditional Raas */}
                  <div
                    onClick={() => handleInitiateBooking("general")}
                    className="flex-shrink-0 w-44 rounded-2xl bg-[#291b24] p-4 flex flex-col justify-between border border-[#403039] shadow-md hover:border-[#ffb688]/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#7c2a38] flex items-center justify-center text-[#ffb2b9]">
                          <Flame className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-[#f0bf5c] font-bold uppercase tracking-wider">Arena 01</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="font-serif text-sm text-[#f4dce8] font-semibold leading-snug">
                          Traditional Raas
                        </h3>
                        <p className="text-[11px] text-[#ddc1b1] mt-1 line-clamp-2 leading-relaxed">
                          Sacred concentric Garba circles with hand-carved sheesham dandiyas.
                        </p>
                      </div>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#e87920] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Book Passes <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Card 2: Folk Fusion */}
                  <div
                    onClick={() => handleInitiateBooking("general")}
                    className="flex-shrink-0 w-44 rounded-2xl bg-[#291b24] p-4 flex flex-col justify-between border border-[#403039] shadow-md hover:border-[#ffb688]/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#e87920]/20 flex items-center justify-center text-[#ffb688]">
                          <Radio className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-[#f0bf5c] font-bold uppercase tracking-wider">Arena 02</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="font-serif text-sm text-[#f4dce8] font-semibold leading-snug">Folk Fusion</h3>
                        <p className="text-[11px] text-[#ddc1b1] mt-1 line-clamp-2 leading-relaxed">
                          Echoes of Kutch featuring live harmonium, dhol, & 12-string sarangi.
                        </p>
                      </div>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#e87920] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Hear Lineup <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Card 3: VIP Royal Pavilions */}
                  <div
                    onClick={() => handleInitiateBooking("vip")}
                    className="flex-shrink-0 w-44 rounded-2xl bg-[#291b24] p-4 flex flex-col justify-between border border-[#403039] shadow-md hover:border-[#ffb688]/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#bc9032]/30 flex items-center justify-center text-[#f0bf5c]">
                          <Star className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-[#f0bf5c] font-bold uppercase tracking-wider">VIP Lounge</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="font-serif text-sm text-[#f4dce8] font-semibold leading-snug">
                          Royal Pavilions
                        </h3>
                        <p className="text-[11px] text-[#ddc1b1] mt-1 line-clamp-2 leading-relaxed">
                          Plush velvet baithaks, dedicated butler service & heritage mocktails.
                        </p>
                      </div>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#e87920] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Reserve VIP <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Card 4: Midnight Baithak */}
                  <div
                    onClick={() => handleInitiateBooking("season")}
                    className="flex-shrink-0 w-44 rounded-2xl bg-[#291b24] p-4 flex flex-col justify-between border border-[#403039] shadow-md hover:border-[#ffb688]/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#403039] flex items-center justify-center text-[#ddc1b1]">
                          <Music className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-[#f0bf5c] font-bold uppercase tracking-wider">Late Night</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="font-serif text-sm text-[#f4dce8] font-semibold leading-snug">
                          Midnight Baithak
                        </h3>
                        <p className="text-[11px] text-[#ddc1b1] mt-1 line-clamp-2 leading-relaxed">
                          Intimate flute and tabla ragas under the open banyan canopy till 2 AM.
                        </p>
                      </div>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#e87920] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Season Pass <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </section>

              {/* THE EXPERIENCE: EDITORIAL SPOTLIGHT */}
              <section className="px-4 py-6 w-full flex flex-col gap-4" id="experience-section">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e87920]">
                    Sensory Heritage
                  </span>
                  <h2 className="font-serif text-xl text-[#f4dce8] font-semibold">The Live Organic Mandap</h2>
                </div>

                {/* Editorial Feature Card */}
                <div className="relative rounded-2xl overflow-hidden bg-[#251820] border border-[#403039] shadow-lg">
                  <div className="relative w-full h-56">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3WLT3FhR01WP83aoWTRxHbxAedAYLkEDmx1XcUi_ErTexQxG3NqSa2bv46WC86cGHQM2DaddP4ttQLTfOyTFbuA5sKF9AmO0w5ZZuoefq6GuRSLnjYtVV3Ersmh16YbO4tjPFVHVW65aYAfWkk7Lf14TnEH4skFFDjNTbeYl7kkCEfOmnZL3fNeid0CzwROAaz8wVMw0bPo5gN2WIl5Ftn0dm01R-QcEp2PYzZfDQ8qzvrBC_kEEa1Q"
                      alt="Indian heritage classical folk orchestra performing live with bansuri flute, dhol and harmonium"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/garba_featured.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#251820] via-[#251820]/30 to-transparent pointer-events-none"></div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#160a12]/85 backdrop-blur-md flex items-center gap-1.5 text-[#f0bf5c] text-[11px] font-semibold border border-[#f0bf5c]/30">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Zero Synthetic Synthesizers</span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#e87920]/20 text-[#ffb688] text-[10px] font-bold uppercase tracking-wide border border-[#e87920]/30">
                        1,000 Brass Diyas
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#7c2a38]/30 text-[#ffb2b9] text-[10px] font-bold uppercase tracking-wide border border-[#7c2a38]/40">
                        40-Piece Ensemble
                      </span>
                    </div>

                    <p className="text-xs text-[#ddc1b1] leading-relaxed">
                      Hear the cadence of untreated goatskin dhols, tuned copper manjiras, and vocal harmonies
                      reverberating naturally across stone jali arches. Experience Navratri the way it was celebrated for
                      centuries.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-[#291b24] rounded-xl p-2.5 flex items-start gap-2 border border-[#403039]">
                        <CheckCircle2 className="w-4 h-4 text-[#f0bf5c] mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#f4dce8]">Artisanal Dandiya</span>
                          <span className="text-[10px] text-[#ddc1b1]">Pair included with entry</span>
                        </div>
                      </div>
                      <div className="bg-[#291b24] rounded-xl p-2.5 flex items-start gap-2 border border-[#403039]">
                        <Flame className="w-4 h-4 text-[#e87920] mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#f4dce8]">Maha Aarti</span>
                          <span className="text-[10px] text-[#ddc1b1]">Midnight synchronized</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* INTERACTIVE TIMELINE (DAY SEQUENCE) */}
              <section className="px-4 py-6 w-full flex flex-col gap-4">
                <div className="flex flex-col mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                    16 October
                  </span>
                  <h2 className="font-serif text-2xl text-[#f4dce8] font-semibold mt-1">
                    Festival Schedule
                  </h2>
                </div>

                {/* Timeline Rail */}
                <div className="relative pl-[34px] flex flex-col gap-6 before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-[#f0bf5c]/60 before:via-[#403039] before:to-transparent pb-4">
                  {/* Node 1 */}
                  <div className="relative flex flex-col gap-1.5 pt-1">
                    <span className="absolute -left-[24px] top-2.5 w-3 h-3 rounded-full bg-[#f0bf5c] ring-[5px] ring-[#1c0f18] shadow-[0_0_8px_rgba(240,191,92,0.6)]"></span>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-black text-[#f0bf5c] tracking-tight leading-none">18:30</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[10px] font-medium tracking-wide uppercase">
                        Courtyard
                      </span>
                    </div>
                    <h4 className="font-serif text-[13px] font-bold text-white tracking-wide mt-0.5">
                      Gates Open & Sacred Shankh Naad
                    </h4>
                    <p className="text-[11px] text-[#a58c7d] leading-relaxed">
                      108 sacred conch shells sounded in acoustic unison to inaugurate the festival.
                    </p>
                  </div>

                  {/* Node 2 */}
                  <div className="relative flex flex-col gap-1.5">
                    <span className="absolute -left-[24px] top-1.5 w-3 h-3 rounded-full bg-[#ffb688] ring-[5px] ring-[#1c0f18]"></span>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-black text-[#ffb688] tracking-tight leading-none">19:15</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[10px] font-medium tracking-wide uppercase">
                        Entry Porch
                      </span>
                    </div>
                    <h4 className="font-serif text-[13px] font-bold text-white tracking-wide mt-0.5">
                      Swagat & Traditional Dhol Tasha
                    </h4>
                    <p className="text-[11px] text-[#a58c7d] leading-relaxed">
                      Guests receive kumkum tilak, organic marigold malas, and hand-turned rosewood dandiyas.
                    </p>
                  </div>

                  {/* Node 3: Active Spotlight / Headliner */}
                  <div className="relative">
                    <span className="absolute -left-[24px] top-6 w-3 h-3 rounded-full bg-[#e87920] ring-[5px] ring-[#1c0f18] shadow-[0_0_12px_rgba(232,121,32,0.8)] z-10"></span>
                    <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#291b24] to-[#1c0f18] border border-[#e87920]/40 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e87920]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#e87920] tracking-tight leading-none">20:00</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#e87920]/20 text-[#e87920] text-[9px] font-black tracking-wider uppercase border border-[#e87920]/30">
                            HEADLINER
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#34262f] border border-[#e87920]/20 text-[#f4dce8] text-[10px] font-medium tracking-wide uppercase">
                          Heritage Mandap
                        </span>
                      </div>
                      <h4 className="font-serif text-[14px] font-bold text-white tracking-wide mt-1 relative z-10">
                        Pratham Raas: Siddharth Bhavsar & Troupe
                      </h4>
                      <p className="text-[11px] text-[#ddc1b1] leading-relaxed relative z-10">
                        3-hour nonstop traditional Dakla and vintage Gujarati folk compositions under open night skies.
                      </p>
                    </div>
                  </div>

                  {/* Node 4 */}
                  <div className="relative flex flex-col gap-1.5">
                    <span className="absolute -left-[24px] top-1.5 w-3 h-3 rounded-full bg-[#ffb2b9] ring-[5px] ring-[#1c0f18]"></span>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-black text-[#ffb2b9] tracking-tight leading-none">22:30</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[10px] font-medium tracking-wide uppercase">
                        Central Arena
                      </span>
                    </div>
                    <h4 className="font-serif text-[13px] font-bold text-white tracking-wide mt-0.5">
                      Maha Garba: 5-Ring Synchrony
                    </h4>
                    <p className="text-[11px] text-[#a58c7d] leading-relaxed">
                      3,000 revelers rotating in concentric synchronicity guided by senior folk choreographers.
                    </p>
                  </div>

                  {/* Node 5 */}
                  <div className="relative flex flex-col gap-1.5">
                    <span className="absolute -left-[24px] top-1.5 w-3 h-3 rounded-full bg-[#f0bf5c] ring-[5px] ring-[#1c0f18]"></span>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-black text-[#f0bf5c] tracking-tight leading-none">00:00</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[10px] font-medium tracking-wide uppercase">
                        All Arenas
                      </span>
                    </div>
                    <h4 className="font-serif text-[13px] font-bold text-white tracking-wide mt-0.5">
                      Midnight Maha Aarti & Lanterns
                    </h4>
                    <p className="text-[11px] text-[#a58c7d] leading-relaxed">
                      Festival lights dim to starlight as 1,008 bronze diyas illuminate the water reflection pavilion.
                    </p>
                  </div>

                  {/* Node 6 */}
                  <div className="relative flex flex-col gap-1.5">
                    <span className="absolute -left-[24px] top-1.5 w-3 h-3 rounded-full bg-[#403039] ring-[5px] ring-[#1c0f18]"></span>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-black text-[#ddc1b1] tracking-tight leading-none">00:45 – 02:00</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[10px] font-medium tracking-wide uppercase">
                        Baithak Courtyard
                      </span>
                    </div>
                    <h4 className="font-serif text-[13px] font-bold text-white tracking-wide mt-0.5">
                      Acoustic Flute & Baithak Sessions
                    </h4>
                    <p className="text-[11px] text-[#a58c7d] leading-relaxed pb-4">
                      Midnight tea, hot saffron kulfi, and contemplative ragas under open skies.
                    </p>
                  </div>
                </div>
              </section>

              {/* TICKET & PASS SELECTION SHOWCASE */}
              <section className="px-4 py-6 w-full flex flex-col gap-4" id="ticket-passes">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e87920]">
                    Digital Admission Credentials
                  </span>
                  <h2 className="font-serif text-xl text-[#f4dce8] font-semibold">Select Your Festival Pass</h2>
                  <p className="text-xs text-[#ddc1b1] mt-1 leading-relaxed">
                    Smart NFC-enabled wristband collected upon arrival. All taxes included.
                  </p>
                </div>

                {/* Pass 1: General Entry Pass */}
                <div 
                  onClick={() => setSelectedPassType("general")}
                  className={`group relative rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ease-out cursor-pointer ${
                    selectedPassType === "general" 
                      ? "bg-gradient-to-br from-[#34262f] to-[#1c0f18] border-[#e87920] shadow-[0_8px_30px_rgba(232,121,32,0.2)] ring-1 ring-[#e87920]" 
                      : "bg-[#291b24]/40 backdrop-blur-md border-[#403039] hover:-translate-y-1 hover:shadow-xl hover:bg-[#291b24]/60 hover:border-[#564337]"
                  }`}
                >


                  {/* Subtle Background Glow when selected */}
                  {selectedPassType === "general" && (
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#e87920]/15 blur-[35px] rounded-full pointer-events-none" />
                  )}

                  {/* Header row */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[9px] font-extrabold uppercase tracking-[0.18em] ${
                        selectedPassType === "general" ? "text-[#e87920]" : "text-[#a58c7d]"
                      }`}>Single Entry</span>
                      <h3 className="font-serif text-[17px] leading-tight text-[#f4dce8] font-bold">Single</h3>
                      <span className="text-[11px] text-[#a58c7d] font-medium">1 person · Oct 13</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[11px] text-[#6b5048] line-through">₹249</span>
                        <span className={`text-[22px] font-black leading-none ${
                          selectedPassType === "general" ? "text-[#f4dce8]" : "text-[#f4dce8]"
                        }`}>₹149</span>
                      </div>
                      <span className="text-[9px] font-bold text-[#e87920] bg-[#e87920]/10 px-1.5 py-0.5 rounded-full">Save ₹100</span>
                    </div>
                  </div>

                  {/* Perk pills */}
                  <div className="relative z-10 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#ddc1b1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#f0bf5c]" />Dandiya Pair
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#ddc1b1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#f0bf5c]" />Water Pavilion
                    </span>
                  </div>

                  {/* Perforation */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className={`flex-1 h-px ${
                      selectedPassType === "general" ? "bg-gradient-to-r from-[#e87920]/20 via-[#e87920]/40 to-[#e87920]/20" : "bg-gradient-to-r from-transparent via-[#403039] to-transparent"
                    }`} style={{backgroundImage: selectedPassType === "general" ? `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(232,121,32,0.35) 4px, rgba(232,121,32,0.35) 8px)` : `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(86,67,55,0.4) 4px, rgba(86,67,55,0.4) 8px)`}} />
                    <span className={`text-[10px] flex-shrink-0 select-none ${
                      selectedPassType === "general" ? "text-[#e87920]/50" : "text-[#564337]/50"
                    }`}>✂</span>
                    <div className="flex-1" style={{height: '1px', backgroundImage: selectedPassType === "general" ? `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(232,121,32,0.35) 4px, rgba(232,121,32,0.35) 8px)` : `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(86,67,55,0.4) 4px, rgba(86,67,55,0.4) 8px)`}} />
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        selectedPassType === "general" ? "bg-[#e87920]" : "bg-[#403039]"
                      }`} />
                      <span className="text-[9px] text-[#a58c7d] uppercase tracking-wider font-semibold">Fast-track QR</span>
                    </div>
                    {selectedPassType === "general" && (
                      <div className="flex items-center bg-[#291b24] rounded-full p-1 border border-[#403039] animate-in fade-in zoom-in duration-200">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateQty("general", -1); }} className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]">
                          <Minus className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                        <span className="text-xs font-bold px-3 min-w-[28px] text-center text-white select-none">{qtyGeneral}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateQty("general", 1); }} className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]">
                          <Plus className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pass 2: Season Pass (1 Night) - Best Value */}
                <div 
                  onClick={() => setSelectedPassType("season")}
                  className={`group relative rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ease-out cursor-pointer ${
                    selectedPassType === "season" 
                      ? "bg-gradient-to-br from-[#34262f] to-[#1c0f18] border-[#f0bf5c] shadow-[0_8px_30px_rgba(240,191,92,0.2)] ring-1 ring-[#f0bf5c]" 
                      : "bg-[#291b24]/40 backdrop-blur-md border-[#403039] hover:-translate-y-1 hover:shadow-xl hover:bg-[#291b24]/60 hover:border-[#564337]"
                  }`}
                >
                  {/* Left accent stripe removed */}

                  {selectedPassType === "season" && (
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#f0bf5c]/15 blur-[35px] rounded-full pointer-events-none" />
                  )}

                  {/* Header row */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold uppercase tracking-[0.18em] ${
                          selectedPassType === "season" ? "text-[#f0bf5c]" : "text-[#a58c7d]"
                        }`}>Couple Pass</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#f0bf5c]/15 text-[#f0bf5c] text-[8px] uppercase font-extrabold tracking-wide border border-[#f0bf5c]/30">
                          Best Value
                        </span>
                      </div>
                      <h3 className="font-serif text-[17px] leading-tight text-[#f4dce8] font-bold">Couple</h3>
                      <span className="text-[11px] text-[#a58c7d] font-medium">2 persons · Oct 13</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[11px] text-[#6b5048] line-through">₹298</span>
                        <span className="text-[22px] font-black leading-none text-[#f0bf5c]">₹249</span>
                      </div>
                      <span className="text-[9px] font-bold text-[#f0bf5c] bg-[#f0bf5c]/10 px-1.5 py-0.5 rounded-full">Save ₹49</span>
                    </div>
                  </div>

                  {/* Perk pills */}
                  <div className="relative z-10 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#ddc1b1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-[#f0bf5c]" />Group Entry
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#ddc1b1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3 text-[#f0bf5c]" />Express Lane
                    </span>
                  </div>

                  {/* Perforation */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className="flex-1 h-px" style={{backgroundImage: selectedPassType === "season" ? `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(240,191,92,0.35) 4px, rgba(240,191,92,0.35) 8px)` : `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(86,67,55,0.4) 4px, rgba(86,67,55,0.4) 8px)`}} />
                    <span className={`text-[10px] flex-shrink-0 select-none ${
                      selectedPassType === "season" ? "text-[#f0bf5c]/50" : "text-[#564337]/50"
                    }`}>✂</span>
                    <div className="flex-1 h-px" style={{backgroundImage: selectedPassType === "season" ? `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(240,191,92,0.35) 4px, rgba(240,191,92,0.35) 8px)` : `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(86,67,55,0.4) 4px, rgba(86,67,55,0.4) 8px)`}} />
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        selectedPassType === "season" ? "bg-[#f0bf5c]" : "bg-[#403039]"
                      }`} />
                      <span className="text-[9px] text-[#a58c7d] uppercase tracking-wider font-semibold">Keepsake Pass</span>
                    </div>
                    {selectedPassType === "season" && (
                      <div className="flex items-center bg-[#291b24] rounded-full p-1 border border-[#403039] animate-in fade-in zoom-in duration-200">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateQty("season", -1); }} className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]">
                          <Minus className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                        <span className="text-xs font-bold px-3 min-w-[28px] text-center text-white select-none">{qtySeason}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateQty("season", 1); }} className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]">
                          <Plus className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pass 3: VIP Royal Pavilion */}
                <div 
                  onClick={() => setSelectedPassType("vip")}
                  className={`group relative rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ease-out cursor-pointer ${
                    selectedPassType === "vip" 
                      ? "bg-gradient-to-br from-[#7c2a38]/40 to-[#1c0f18] border-[#ffb2b9] shadow-[0_8px_30px_rgba(255,178,185,0.25)] ring-1 ring-[#ffb2b9]" 
                      : "bg-[#291b24]/40 backdrop-blur-md border-[#403039] hover:-translate-y-1 hover:shadow-xl hover:bg-[#291b24]/60 hover:border-[#564337]"
                  }`}
                >
                  {/* Left accent stripe removed */}

                  {selectedPassType === "vip" && (
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#ffb2b9]/20 blur-[35px] rounded-full pointer-events-none" />
                  )}

                  {/* Header row */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold uppercase tracking-[0.18em] ${
                          selectedPassType === "vip" ? "text-[#ffb2b9]" : "text-[#a58c7d]"
                        }`}>Family (4+1)</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#ffb2b9]/15 text-[#ffb2b9] text-[8px] uppercase font-extrabold tracking-wide border border-[#ffb2b9]/30">
                          Premium
                        </span>
                      </div>
                      <h3 className="font-serif text-[17px] leading-tight text-[#f4dce8] font-bold">Family</h3>
                      <span className="text-[11px] text-[#a58c7d] font-medium">5 persons · Oct 13</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[11px] text-[#6b5048] line-through">₹745</span>
                        <span className="text-[22px] font-black leading-none text-[#ffb2b9]">₹499</span>
                      </div>
                      <span className="text-[9px] font-bold text-[#ffb2b9] bg-[#ffb2b9]/10 px-1.5 py-0.5 rounded-full">Save ₹246</span>
                    </div>
                  </div>

                  {/* Perk pills */}
                  <div className="relative z-10 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#ddc1b1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-full">
                      <Award className="w-3 h-3 text-[#ffb2b9]" />Baithak View
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#ddc1b1] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-full">
                      <Car className="w-3 h-3 text-[#ffb2b9]" />Valet Access
                    </span>
                  </div>

                  {/* Perforation */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className="flex-1 h-px" style={{backgroundImage: selectedPassType === "vip" ? `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(255,178,185,0.35) 4px, rgba(255,178,185,0.35) 8px)` : `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(86,67,55,0.4) 4px, rgba(86,67,55,0.4) 8px)`}} />
                    <span className={`text-[10px] flex-shrink-0 select-none ${
                      selectedPassType === "vip" ? "text-[#ffb2b9]/50" : "text-[#564337]/50"
                    }`}>✂</span>
                    <div className="flex-1 h-px" style={{backgroundImage: selectedPassType === "vip" ? `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(255,178,185,0.35) 4px, rgba(255,178,185,0.35) 8px)` : `repeating-linear-gradient(to right, transparent, transparent 4px, rgba(86,67,55,0.4) 4px, rgba(86,67,55,0.4) 8px)`}} />
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        selectedPassType === "vip" ? "bg-[#ffb2b9] animate-pulse" : "bg-[#403039]"
                      }`} />
                      <span className={`text-[9px] uppercase tracking-wider font-semibold ${
                        selectedPassType === "vip" ? "text-[#ffb2b9]" : "text-[#a58c7d]"
                      }`}>Limited Availability</span>
                    </div>
                    {selectedPassType === "vip" && (
                      <div className="flex items-center bg-[#291b24] rounded-full p-1 border border-[#403039] animate-in fade-in zoom-in duration-200">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateQty("vip", -1); }} className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]">
                          <Minus className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                        <span className="text-xs font-bold px-3 min-w-[28px] text-center text-white select-none">{qtyVip}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateQty("vip", 1); }} className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]">
                          <Plus className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* VENUE & ARRIVAL LOGISTICS */}
              <section className="px-4 py-6 w-full flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                    Amphitheatre Location
                  </span>
                  <h2 className="font-serif text-xl text-[#f4dce8] font-semibold">Arrive With Grace</h2>
                  <p className="text-xs text-[#ddc1b1] mt-1 leading-relaxed">
                    Sarkhej-Gandhinagar Corridor, {selectedCity}, Gujarat.
                  </p>
                </div>

                {/* Map Visual Component */}
                <div
                  className="w-full h-44 rounded-2xl bg-[#34262f] relative overflow-hidden flex flex-col justify-end p-4 border border-[#403039] shadow-md bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDy-ecMNDIrguJOBvaeEnz4R-RxzVOssFhsoRSjpzXVZ-lkdUXa3K9H4WAzhr8NpE2hxbsqoTQMjgHgMO5-eJ2D1-QSQhV2khxioYLkjEbSQzQ1VaNgoOWqebqRP_Wmw7g-aKJL2i4Vtc9qQSm-qsVJvC_C8Mj7XcmNN_cOuTQSYGjG_SMpqE6rYo7yudH5SJjA0yngmsN7xjxzAxnEGq2iJjWnpj7NXpsoF1_FaEWl_7d8ixVy2z9nRA')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#160a12] via-[#160a12]/40 to-transparent pointer-events-none"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#e87920] flex items-center justify-center text-[#502300] shadow-sm">
                        <Navigation className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#f4dce8] leading-tight">
                          Gate 03 • VIP & General
                        </span>
                        <span className="text-[10px] text-[#ddc1b1]">
                          25 mins from Sardar Vallabhbhai Patel Airport
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        window.open("https://maps.google.com/?q=Begusarai+Bihar", "_blank")
                      }
                      className="px-3 py-1.5 rounded-full bg-[#44353e] text-[#f4dce8] text-xs font-bold flex items-center gap-1 hover:bg-[#ffb688] hover:text-[#502300] transition-colors border border-[#403039]"
                    >
                      <span>Maps</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Arrival Facilities Matrix */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#291b24] border border-[#403039] flex items-center gap-2.5">
                    <Car className="w-5 h-5 text-[#ffb688] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#f4dce8]">Complimentary Valet</span>
                      <span className="text-[10px] text-[#ddc1b1]">For VIP and season passes</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#291b24] border border-[#403039] flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-[#f0bf5c] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#f4dce8]">Escorted Security</span>
                      <span className="text-[10px] text-[#ddc1b1]">24/7 dedicated surveillance</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#291b24] border border-[#403039] flex items-center gap-2.5">
                    <Accessibility className="w-5 h-5 text-[#ffb2b9] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#f4dce8]">Accessibility Ramps</span>
                      <span className="text-[10px] text-[#ddc1b1]">Zero-step arena entries</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#291b24] border border-[#403039] flex items-center gap-2.5">
                    <Bus className="w-5 h-5 text-[#ffdea4] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#f4dce8]">Metro Shuttles</span>
                      <span className="text-[10px] text-[#ddc1b1]">Every 15m from Thaltej</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* AUTHENTICITY & TRUST PROTOCOL STRIP */}
              <section className="px-4 py-4 w-full">
                <div className="p-4 rounded-2xl bg-[#251820] border border-[#403039] flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#f0bf5c]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                      Heritage Protocol & Guidelines
                    </span>
                  </div>
                  <p className="text-xs text-[#ddc1b1] leading-relaxed">
                    Presented in partnership with the{" "}
                    <strong className="text-[#f4dce8]">Gujarat Heritage Arts Council</strong>. Raas Nirvana maintains
                    an uncompromising reverence for cultural sanctity and guest safety.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-full bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#e87920]" /> Traditional Dress Enforced
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#e87920]" /> 100% Zero-Plastic Campus
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#291b24] border border-[#403039] text-[#ddc1b1] text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#e87920]" /> Emergency Doctors On-Site
                    </span>
                  </div>
                </div>
              </section>

              {/* FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
              <section className="px-4 py-6 w-full flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e87920]">
                    Help & Clarifications
                  </span>
                  <h2 className="font-serif text-xl text-[#f4dce8] font-semibold">Frequently Asked Questions</h2>
                </div>

                {/* FAQ 1 */}
                <div
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  className="rounded-xl bg-[#291b24] border border-[#403039] p-3.5 flex flex-col gap-2 cursor-pointer transition-colors hover:border-[#ffb688]/40"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#f4dce8]">What is the mandatory dress code?</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-[#ddc1b1] transition-transform duration-200 ${
                        openFaq === 1 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openFaq === 1 && (
                    <p className="text-[11px] text-[#ddc1b1] pt-1 leading-relaxed border-t border-[#403039]/60">
                      Traditional ethnic wear is strictly required. For women: Chaniya Choli, Kurti-Ghaghra, or Saree.
                      For men: Kediyu, Kurta-Dhoti, or Pathani suit. Western casuals (jeans, t-shirts, sneakers) are not
                      permitted inside the performance mandap.
                    </p>
                  )}
                </div>

                {/* FAQ 2 */}
                <div
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  className="rounded-xl bg-[#291b24] border border-[#403039] p-3.5 flex flex-col gap-2 cursor-pointer transition-colors hover:border-[#ffb688]/40"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#f4dce8]">
                      Do I need to bring my own Dandiya sticks?
                    </h4>
                    <ChevronDown
                      className={`w-4 h-4 text-[#ddc1b1] transition-transform duration-200 ${
                        openFaq === 2 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openFaq === 2 && (
                    <p className="text-[11px] text-[#ddc1b1] pt-1 leading-relaxed border-t border-[#403039]/60">
                      Every ticket tier includes an authentic pair of hand-turned, weighted rosewood dandiyas presented
                      at the welcome porch. You are also welcome to bring your personal heirloom wooden dandiyas
                      (metallic or LED sticks are prohibited).
                    </p>
                  )}
                </div>

                {/* FAQ 3 */}
                <div
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  className="rounded-xl bg-[#291b24] border border-[#403039] p-3.5 flex flex-col gap-2 cursor-pointer transition-colors hover:border-[#ffb688]/40"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#f4dce8]">Can I transfer or reschedule my pass?</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-[#ddc1b1] transition-transform duration-200 ${
                        openFaq === 3 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openFaq === 3 && (
                    <p className="text-[11px] text-[#ddc1b1] pt-1 leading-relaxed border-t border-[#403039]/60">
                      Passes can be reassigned to friends or family up to 24 hours prior to the festival date directly
                      inside the &quot;My Pass&quot; wallet tab. Single night passes cannot be refunded once purchased.
                    </p>
                  )}
                </div>

                {/* FAQ 4 */}
                <div
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                  className="rounded-xl bg-[#291b24] border border-[#403039] p-3.5 flex flex-col gap-2 cursor-pointer transition-colors hover:border-[#ffb688]/40"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#f4dce8]">Is there an age requirement for entry?</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-[#ddc1b1] transition-transform duration-200 ${
                        openFaq === 4 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openFaq === 4 && (
                    <p className="text-[11px] text-[#ddc1b1] pt-1 leading-relaxed border-t border-[#403039]/60">
                      Raas Nirvana is an all-ages family cultural celebration. Children aged 6 and under enjoy free
                      entry under adult supervision. Children 7 and above require a standard General Entry pass.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: EXPERIENCE (Deep dive into arenas, audio, line-ups) */}
          {activeTab === "experience" && (
            <div className="p-4 flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                  Atmospheric Sanctum
                </span>
                <h2 className="font-serif text-2xl text-white font-bold">The Heritage Experience</h2>
                <p className="text-xs text-[#ddc1b1] mt-1 leading-relaxed">
                  Immerse yourself in authentic Rajasthani-Gujarati folk architecture and acoustic clarity.
                </p>
              </div>

              {/* High-res visual highlight */}
              <div className="relative rounded-2xl overflow-hidden h-64 border border-[#403039] shadow-xl">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3WLT3FhR01WP83aoWTRxHbxAedAYLkEDmx1XcUi_ErTexQxG3NqSa2bv46WC86cGHQM2DaddP4ttQLTfOyTFbuA5sKF9AmO0w5ZZuoefq6GuRSLnjYtVV3Ersmh16YbO4tjPFVHVW65aYAfWkk7Lf14TnEH4skFFDjNTbeYl7kkCEfOmnZL3fNeid0CzwROAaz8wVMw0bPo5gN2WIl5Ftn0dm01R-QcEp2PYzZfDQ8qzvrBC_kEEa1Q"
                  alt="Orchestra"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#160a12] via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">40-Piece Acoustic Troupe</span>
                    <span className="text-[10px] text-[#f0bf5c]">Playing live every night from 7 PM to 2 AM</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-[#e87920] text-[#502300] text-xs font-bold flex items-center gap-1 shadow-md">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {/* Curated Realm Details */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#291b24] border border-[#403039]">
                  <div className="flex items-center gap-2 text-[#e87920] font-bold text-xs uppercase tracking-wider">
                    <Flame className="w-4 h-4" /> Sacred Garba Mandap
                  </div>
                  <h3 className="font-serif text-base font-semibold text-white mt-1">Concentric 5-Ring Synchrony</h3>
                  <p className="text-xs text-[#ddc1b1] mt-1 leading-relaxed">
                    Designed according to ancient temple geometry. The center houses the sacred Akhand Diya, followed by
                    5 rings accommodating up to 3,500 simultaneous dancers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#291b24] border border-[#403039]">
                  <div className="flex items-center gap-2 text-[#f0bf5c] font-bold text-xs uppercase tracking-wider">
                    <Music className="w-4 h-4" /> Folk-Fusion Orchestra
                  </div>
                  <h3 className="font-serif text-base font-semibold text-white mt-1">Natural Unamplified Sound</h3>
                  <p className="text-xs text-[#ddc1b1] mt-1 leading-relaxed">
                    Featuring authentic instruments: Shehnai, Duff, Manjira, Tabla, Pakhawaj, and Sheesham Dandiyas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASSES (Direct Booking & Breakdown) */}
          {activeTab === "passes" && (
            <div className="p-4 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e87920]">
                  Official Booking
                </span>
                <h2 className="font-serif text-2xl text-white font-bold">Festival Passes</h2>
                <p className="text-xs text-[#ddc1b1] mt-1">Select your pass and quantity below for instant check-in.</p>
              </div>

              {/* Summary box */}
              <div className="p-4 rounded-2xl bg-[#291b24] border border-[#e87920]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#a58c7d] uppercase tracking-wider font-semibold">Your Cart</span>
                  <p className="text-lg font-bold text-white">{totalTickets} Passes Selected</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#a58c7d] uppercase tracking-wider font-semibold">Subtotal</span>
                  <p className="text-xl font-extrabold text-[#f0bf5c]">₹{totalPrice.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Direct Booking Cards */}
              <div className="space-y-3">
                {/* General Pass */}
                <div 
                  onClick={() => setSelectedPassType("general")}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                    selectedPassType === "general" 
                      ? "bg-[#34262f] border-[#e87920] shadow-[0_0_15px_rgba(232,121,32,0.15)] ring-1 ring-[#e87920]" 
                      : "bg-[#291b24] border-[#403039]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-serif text-base font-bold ${selectedPassType === "general" ? "text-white" : "text-[#ddc1b1]"}`}>1 Ticket</h3>
                      <p className="text-xs text-[#ddc1b1]/70">Valid for 1 person</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-[#a58c7d] line-through decoration-[#7c2a38]">₹599</span>
                      <span className={`text-lg font-bold leading-none ${selectedPassType === "general" ? "text-white" : "text-[#ddc1b1]"}`}>₹199</span>
                    </div>
                  </div>
                  {selectedPassType === "general" && (
                    <div className="flex justify-between items-center pt-3 border-t border-[#403039]/60 mt-1">
                      <span className="text-[10px] font-bold tracking-wider text-[#e87920] uppercase">SELECTED</span>
                      <div className="flex items-center bg-[#291b24] rounded-full p-1 border border-[#403039]">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateQty("general", -1); }}
                          className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-3 w-8 text-center">{qtyGeneral}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateQty("general", 1); }}
                          className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Season Pass */}
                <div 
                  onClick={() => setSelectedPassType("season")}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                    selectedPassType === "season" 
                      ? "bg-[#34262f] border-[#f0bf5c] shadow-[0_0_15px_rgba(240,191,92,0.15)] ring-1 ring-[#f0bf5c]" 
                      : "bg-[#291b24] border-[#403039]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-serif text-base font-bold ${selectedPassType === "season" ? "text-white" : "text-[#ddc1b1]"}`}>4 Tickets</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#bc9032]/40 text-[#f0bf5c] text-[9px] font-bold">
                          BEST VALUE
                        </span>
                      </div>
                      <p className="text-xs text-[#ddc1b1]/70">Valid for 4 persons</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-[#a58c7d] line-through decoration-[#7c2a38]">₹2396</span>
                      <span className={`text-lg font-bold leading-none ${selectedPassType === "season" ? "text-[#f0bf5c]" : "text-[#ddc1b1]"}`}>₹599</span>
                    </div>
                  </div>
                  {selectedPassType === "season" && (
                    <div className="flex justify-between items-center pt-3 border-t border-[#403039]/60 mt-1">
                      <span className="text-[10px] font-bold tracking-wider text-[#f0bf5c] uppercase">SELECTED</span>
                      <div className="flex items-center bg-[#291b24] rounded-full p-1 border border-[#403039]">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateQty("season", -1); }}
                          className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-3 w-8 text-center">{qtySeason}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateQty("season", 1); }}
                          className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Royal VIP */}
                <div 
                  onClick={() => setSelectedPassType("vip")}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                    selectedPassType === "vip" 
                      ? "bg-[#7c2a38]/30 border-[#ffb2b9] shadow-[0_0_15px_rgba(255,178,185,0.15)] ring-1 ring-[#ffb2b9]" 
                      : "bg-[#291b24] border-[#403039]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-serif text-base font-bold ${selectedPassType === "vip" ? "text-white" : "text-[#ddc1b1]"}`}>6 Tickets</h3>
                      <p className="text-xs text-[#ddc1b1]/70">Valid for 6 persons</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-[#a58c7d] line-through decoration-[#7c2a38]">₹3594</span>
                      <span className={`text-lg font-bold leading-none ${selectedPassType === "vip" ? "text-[#ffb2b9]" : "text-[#ddc1b1]"}`}>₹898</span>
                    </div>
                  </div>
                  {selectedPassType === "vip" && (
                    <div className="flex justify-between items-center pt-3 border-t border-[#403039]/60 mt-1">
                      <span className="text-[10px] font-bold tracking-wider text-[#ffb2b9] uppercase">SELECTED</span>
                      <div className="flex items-center bg-[#291b24] rounded-full p-1 border border-[#403039]">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateQty("vip", -1); }}
                          className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-3 w-8 text-center">{qtyVip}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateQty("vip", 1); }}
                          className="w-7 h-7 rounded-full bg-[#34262f] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#4a3744]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VENUE (Interactive Logistics & Transport) */}
          {activeTab === "venue" && (
            <div className="p-4 flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                  Ground Logistics
                </span>
                <h2 className="font-serif text-2xl text-white font-bold">Venue & Gates</h2>
                <p className="text-xs text-[#ddc1b1] mt-1 leading-relaxed">
                  Sarkhej-Gandhinagar Corridor, {selectedCity}, Gujarat.
                </p>
              </div>

              {/* Map view */}
              <div
                className="w-full h-52 rounded-2xl relative overflow-hidden flex flex-col justify-end p-4 border border-[#403039] shadow-md bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDy-ecMNDIrguJOBvaeEnz4R-RxzVOssFhsoRSjpzXVZ-lkdUXa3K9H4WAzhr8NpE2hxbsqoTQMjgHgMO5-eJ2D1-QSQhV2khxioYLkjEbSQzQ1VaNgoOWqebqRP_Wmw7g-aKJL2i4Vtc9qQSm-qsVJvC_C8Mj7XcmNN_cOuTQSYGjG_SMpqE6rYo7yudH5SJjA0yngmsN7xjxzAxnEGq2iJjWnpj7NXpsoF1_FaEWl_7d8ixVy2z9nRA')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#160a12] via-[#160a12]/30 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Dedicated Entry: Gate 03</span>
                    <span className="text-xs text-[#f0bf5c]">Begusarai Arena Main Entrance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      window.open("https://maps.google.com/?q=Begusarai+Bihar", "_blank")
                    }
                    className="px-3.5 py-1.5 rounded-full bg-[#e87920] text-[#502300] text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer touch-manipulation"
                  >
                    <Navigation className="w-3.5 h-3.5 pointer-events-none" />
                    <span className="pointer-events-none">Get Directions</span>
                  </button>
                </div>
              </div>

              {/* Live Venue Status Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3.5 rounded-2xl bg-[#291b24] border border-[#403039]">
                  <span className="text-[10px] uppercase font-bold text-[#f0bf5c]">Valet Parking</span>
                  <p className="text-sm font-bold text-white mt-0.5">850 Spots Free</p>
                  <p className="text-[10px] text-[#ddc1b1] mt-0.5">Automated SMS ticket receipt</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#291b24] border border-[#403039]">
                  <span className="text-[10px] uppercase font-bold text-[#ffb688]">Metro Shuttles</span>
                  <p className="text-sm font-bold text-white mt-0.5">Every 10 Mins</p>
                  <p className="text-[10px] text-[#ddc1b1] mt-0.5">Direct from Thaltej Metro</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MY PASS (Digital Festival Wallet with QR Code & Hologram) */}
          {activeTab === "my-pass" && (
            <div className="p-4 flex flex-col items-center gap-4">
              <div className="w-full text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0bf5c]">
                  Digital Ticket Wallet
                </span>
                <h2 className="font-serif text-2xl text-white font-bold">Your Festival Passes</h2>
                <p className="text-xs text-[#ddc1b1] mt-0.5">
                  {bookedPasses.length} Active {bookedPasses.length === 1 ? "credential" : "credentials"} ready for NFC & Gate Scan.
                </p>
              </div>

              {/* Pass List */}
              {bookedPasses.map((pass) => (
                <div
                  key={pass.id}
                  id={`ticket-${pass.id}`}
                  className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#34262f] via-[#291b24] to-[#1c0f18] border-2 border-[#f0bf5c]/60 p-5 shadow-2xl relative overflow-hidden mb-2"
                >
                  {/* Hologram Foil Watermark */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f0bf5c]/20 via-transparent to-transparent rounded-bl-full pointer-events-none"></div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#403039]">
                    <div>
                      <span className="text-[10px] font-bold text-[#f0bf5c] uppercase tracking-widest">
                        OFFICIAL ADMISSION
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white">{pass.title}</h3>
                      <span className="text-[10px] text-[#ddc1b1]">{pass.date}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#e87920]/20 text-[#ffb688] text-[10px] font-bold border border-[#e87920]/40">
                      {pass.id}
                    </div>
                  </div>

                  <div className="py-4 flex flex-col items-center">
                    {/* Scannable Animated QR Code Box */}
                    <div className="relative p-1 rounded-[20px] bg-gradient-to-br from-[#f0bf5c] via-[#e87920] to-[#f0bf5c] shadow-[0_0_20px_rgba(240,191,92,0.3)] w-max mx-auto group">
                      <div className="bg-white p-3 rounded-[16px] flex flex-col items-center justify-center relative overflow-hidden h-[180px] w-[180px]">
                        <img 
                          src={`https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify({
                            id: pass.id,
                            name: pass.holder,
                            phone: pass.phone,
                            type: pass.title,
                            qty: pass.quantity,
                            amt: pass.totalAmount,
                            gate: pass.gate
                          }))}&size=300`} 
                          alt="Ticket QR Code"
                          className="w-32 h-32 object-contain mix-blend-multiply"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
                      <div className="p-2 rounded-xl bg-[#251820]">
                        <span className="text-[9px] text-[#a58c7d] uppercase font-bold">Holder</span>
                        <p className="text-xs font-bold text-white mt-0.5 truncate">{pass.holder}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#251820]">
                        <span className="text-[9px] text-[#a58c7d] uppercase font-bold">Qty</span>
                        <p className="text-xs font-bold text-[#f0bf5c] mt-0.5">{pass.quantity} Person(s)</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#251820]">
                        <span className="text-[9px] text-[#a58c7d] uppercase font-bold">Total</span>
                        <p className="text-xs font-bold text-[#ffb688] mt-0.5">₹{pass.totalAmount.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Notch Perforation Effect */}
                  <div className="relative my-2 py-1 flex items-center justify-between">
                    <div className="absolute -left-7 w-4 h-4 rounded-full bg-[#1c0f18]"></div>
                    <div className="w-full border-t border-dashed border-[#564337]/60"></div>
                    <div className="absolute -right-7 w-4 h-4 rounded-full bg-[#1c0f18]"></div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#ddc1b1]">
                      <CheckCircle2 className="w-4 h-4 text-[#f0bf5c]" />
                      <span>Entry Confirmed • Gate Access</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`Ticket ${pass.id} shared with contacts!`)}
                        className="p-2 rounded-full bg-[#34262f] text-white hover:bg-[#e87920] transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(pass.id)}
                        disabled={isDownloading === pass.id}
                        className="p-2 rounded-full bg-[#34262f] text-white hover:bg-[#e87920] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading === pass.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </main>

        {/* STICKY BOOKING BUTTON (Visible on discover tab) */}
        {activeTab === "discover" && (
          <div className="fixed md:absolute bottom-24 inset-x-0 z-40 max-w-[430px] mx-auto px-4 flex items-center justify-center gap-3 pointer-events-none">
            <button
              type="button"
              onClick={() => {
                const element = document.getElementById('ticket-passes');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex-1 max-w-[130px] h-12 rounded-full bg-[#251820] border border-[#403039] hover:bg-[#34262f] active:scale-[0.98] transition-all flex items-center justify-center text-[#f4dce8] font-bold text-[14px] cursor-pointer touch-manipulation pointer-events-auto"
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => handleInitiateBooking(selectedPassType)}
              className="flex-[2] h-12 rounded-full bg-gradient-to-r from-[#e87920] to-[#f0bf5c] hover:from-[#ffb688] hover:to-[#ffdea4] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[#502300] font-bold text-[13px] tracking-normal shadow-[0_8px_25px_rgba(232,121,32,0.4)] cursor-pointer touch-manipulation pointer-events-auto"
            >
              <Sparkles className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none truncate">
                Book {TICKET_TIERS[selectedPassType].passTypeUI} • ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </button>
          </div>
        )}



        {/* BOTTOM NAVIGATION BAR */}
        <nav className="fixed md:absolute bottom-0 inset-x-0 z-50 pb-safe bg-[#160a12]/95 backdrop-blur-2xl border-t border-[#403039]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.8)] pointer-events-auto select-none">
          <div className="max-w-[430px] mx-auto flex justify-around items-center h-16 px-1 relative pointer-events-auto">
            {/* 1. Discover */}
            <button
              type="button"
              onClick={() => setActiveTab("discover")}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 cursor-pointer touch-manipulation transition-all select-none ${
                activeTab === "discover" ? "text-[#e87920] font-bold" : "text-[#ddc1b1] hover:text-white"
              }`}
            >
              <Flame className="w-5 h-5 pointer-events-none" />
              <span className="text-[9px] uppercase tracking-wider pointer-events-none">Discover</span>
            </button>

            {/* 2. Experience */}
            <button
              type="button"
              onClick={() => setActiveTab("experience")}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 cursor-pointer touch-manipulation transition-all select-none ${
                activeTab === "experience" ? "text-[#e87920] font-bold" : "text-[#ddc1b1] hover:text-white"
              }`}
            >
              <Radio className="w-5 h-5 pointer-events-none" />
              <span className="text-[9px] uppercase tracking-wider pointer-events-none">Experience</span>
            </button>


            {/* 4. My Pass (Wallet) */}
            <button
              type="button"
              onClick={() => setActiveTab("my-pass")}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 cursor-pointer touch-manipulation transition-all relative select-none ${
                activeTab === "my-pass" ? "text-[#e87920] font-bold" : "text-[#ddc1b1] hover:text-white"
              }`}
            >
              <QrCode className="w-5 h-5 pointer-events-none" />
              <span className="text-[9px] uppercase tracking-wider pointer-events-none">My Pass</span>
              {bookedPasses.length > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#e87920] text-[#502300] text-[9px] font-bold flex items-center justify-center pointer-events-none">
                  {bookedPasses.length}
                </span>
              )}
            </button>

            {/* 5. Rightmost: Profile Button */}
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 cursor-pointer touch-manipulation transition-all relative select-none ${
                isProfileDrawerOpen ? "text-[#e87920] font-bold" : "text-[#ddc1b1] hover:text-white"
              }`}
            >
              <div className="relative pointer-events-none">
                {isLoggedIn ? (
                  <div className="w-5 h-5 rounded-full bg-[#e87920] text-[#502300] text-[10px] font-bold flex items-center justify-center ring-1 ring-[#f0bf5c]">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
                {isLoggedIn && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#160a12]"></span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-wider pointer-events-none">Profile</span>
            </button>
          </div>
        </nav>

        {/* ------------------------------------------------------------- */}
        {/* PROFILE MODAL / BOTTOM SHEET (Direct & Responsive) */}
        {/* ------------------------------------------------------------- */}
        {isProfileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsProfileDrawerOpen(false);
            }}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm pointer-events-none" />

            <div className="relative w-full max-w-[394px] mx-3 bg-gradient-to-b from-[#241520] to-[#180d14] border border-[#3a2530]/80 rounded-t-[32px] md:rounded-[32px] pt-7 pb-7 px-5 shadow-[0_-24px_80px_rgba(0,0,0,0.7)] flex flex-col gap-6 text-left max-h-[92vh] overflow-y-auto no-scrollbar pointer-events-auto">
              {/* Drag pill (mobile) */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#3a2530] md:hidden" />

              {/* Ambient glow */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#e87920]/8 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e87920] to-[#bc6316] text-[#502300] flex items-center justify-center font-black text-xl shadow-lg shadow-[#e87920]/25 flex-shrink-0 border border-[#ffb688]/30">
                    {isLoggedIn ? (
                      currentUser?.name?.charAt(0) || "A"
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-[20px] font-bold text-white leading-tight">
                      {isLoggedIn ? currentUser?.name || "Aman Kumar" : "Guest Attendee"}
                    </h3>
                    <p className="text-[12px] text-[#7a5c6a] mt-0.5 font-medium tracking-wide">
                      {isLoggedIn ? currentUser?.phone || "+91 98765 43210" : "Raas Nirvana Navratri 2026"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#2e1b27] hover:bg-[#3f2535] border border-[#3a2530] flex items-center justify-center text-[#7a5c6a] hover:text-white transition-all flex-shrink-0 cursor-pointer touch-manipulation"
                >
                  <X className="w-3.5 h-3.5 pointer-events-none" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="p-3.5 rounded-2xl bg-[#0f0810] border border-[#3a2530] flex items-center justify-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
                <span className="text-[12px] font-semibold text-[#ddc1b1]">
                  {isLoggedIn ? "Verified Attendee Account" : "Access Passes & Bookings"}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
              </div>

              {/* Wallet Passes Shortcut */}
              {isLoggedIn && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#291b24] to-[#1c0f18] border border-[#f0bf5c]/40 flex items-center justify-between shadow-[0_0_15px_rgba(240,191,92,0.05)]">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-white text-[14px]">Festival Pass Wallet</p>
                    <p className="text-[11px] text-[#a58c7d] font-medium">
                      {bookedPasses.length} Active {bookedPasses.length === 1 ? "Pass" : "Passes"} with Digital QR
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDrawerOpen(false);
                      setActiveTab("my-pass");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-[#f0bf5c] to-[#bc9032] text-[#412d00] font-bold text-[11px] hover:brightness-110 shadow-lg shadow-[#f0bf5c]/20 flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation"
                  >
                    <QrCode className="w-3.5 h-3.5 pointer-events-none" />
                    <span className="pointer-events-none">View Passes</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {isLoggedIn ? (
                <div className="flex flex-col gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDrawerOpen(false);
                      handleInitiateBooking("general");
                    }}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#e87920] to-[#bc6316] hover:brightness-110 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-[#e87920]/25 transition-all cursor-pointer touch-manipulation"
                  >
                    <Sparkles className="w-4 h-4 pointer-events-none" />
                    <span className="pointer-events-none">Book More Passes (from ₹199)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full h-12 rounded-xl bg-[#0f0810] border border-[#3a2530] text-[#7a5c6a] hover:text-[#ffdadc] hover:bg-[#7c2a38]/20 hover:border-[#7c2a38]/50 font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation"
                  >
                    <LogOut className="w-4 h-4 pointer-events-none" />
                    <span className="pointer-events-none">Log Out of Account</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (phoneInput.length === 10) {
                      setIsProfileDrawerOpen(false);
                      setIsAuthModalOpen(true);
                      handleSendOtp(e);
                    }
                  }} className="flex flex-col gap-3">
                    <div className="flex items-stretch bg-[#0f0810] rounded-xl border border-[#3a2530] focus-within:border-[#e87920] focus-within:shadow-[0_0_0_3px_rgba(232,121,32,0.1)] transition-all overflow-hidden h-12">
                      <div className="flex items-center gap-1.5 px-3 bg-[#160c12] border-r border-[#3a2530] flex-shrink-0">
                        <span className="text-[14px]">🇮🇳</span>
                        <span className="text-[12px] font-bold text-[#7a5c6a]">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="Mobile Number"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-transparent px-3 py-2 text-[14px] text-white placeholder-[#3a2530] outline-none font-semibold tracking-wide"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={phoneInput.length < 10}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-[#e87920] to-[#d05f10] hover:from-[#f09030] hover:to-[#e87920] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white font-bold text-[13px] shadow-[0_8px_24px_rgba(232,121,32,0.2)] flex items-center justify-center gap-2"
                    >
                      <span>Get OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* AUTHENTICATION MODAL (Phone Number + OTP Verification) */}
        {/* ------------------------------------------------------------- */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsAuthModalOpen(false)} />

            {/* Modal card */}
            <div className="relative w-full max-w-[394px] mx-3 bg-gradient-to-b from-[#241520] to-[#180d14] border border-[#3a2530]/80 rounded-t-[32px] md:rounded-[32px] pt-7 pb-7 px-4 shadow-[0_-24px_80px_rgba(0,0,0,0.7)] flex flex-col gap-6 text-left overflow-hidden">
              {/* Drag pill (mobile) */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#3a2530] md:hidden" />

              {/* Ambient glow */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#e87920]/8 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#7c2a38]/8 blur-[50px] rounded-full pointer-events-none" />

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1.5">
                {["phone", "otp", "profile"].map((step, i) => (
                  <div key={step} className={`h-1 rounded-full transition-all duration-300 ${
                    authStep === step ? "w-6 bg-[#e87920]" :
                    (authStep === "otp" && i === 0) || (authStep === "profile" && i < 2) ? "w-3 bg-[#e87920]/40" :
                    "w-3 bg-[#3a2530]"
                  }`} />
                ))}
              </div>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {/* Icon tile */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${
                    authStep === "phone" ? "bg-gradient-to-br from-[#e87920] to-[#bc6316] shadow-[#e87920]/25" :
                    authStep === "otp" ? "bg-gradient-to-br from-[#f0bf5c] to-[#bc9032] shadow-[#f0bf5c]/25" :
                    "bg-gradient-to-br from-[#ffb2b9] to-[#d97882] shadow-[#ffb2b9]/25"
                  }`}>
                    {authStep === "phone" ? <Phone className="w-5 h-5 text-white" /> :
                     authStep === "otp" ? <ShieldCheck className="w-5 h-5 text-white" /> :
                     <User className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-serif text-[18px] font-bold text-white leading-tight">
                      {authStep === "phone" ? "Verify Mobile Number" :
                       authStep === "otp" ? "Enter Verification OTP" :
                       "Complete Your Profile"}
                    </h3>
                    <p className="text-[11px] text-[#7a5c6a] mt-0.5">
                      {authStep === "phone" ? "Login or create your festival account" :
                       authStep === "otp" ? `Code sent to +91 ${phoneInput}` :
                       "Your name will appear on your festival pass"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#2e1b27] hover:bg-[#3f2535] border border-[#3a2530] flex items-center justify-center text-[#7a5c6a] hover:text-white transition-all flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── STEP 1: Phone ── */}
              {authStep === "phone" && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">Mobile Number</label>
                    <div className="flex items-stretch bg-[#0f0810] rounded-2xl border border-[#3a2530] focus-within:border-[#e87920] focus-within:shadow-[0_0_0_3px_rgba(232,121,32,0.1)] transition-all duration-200 overflow-hidden">
                      <div className="flex items-center gap-2 px-4 bg-[#160c12] border-r border-[#3a2530] flex-shrink-0">
                        <span className="text-[18px] leading-none">🇮🇳</span>
                        <span className="text-[13px] font-bold text-[#7a5c6a]">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="00000 00000"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-transparent px-4 py-4 text-[16px] text-white placeholder-[#3a2530] outline-none font-semibold tracking-widest"
                        autoFocus
                      />
                      {phoneInput.length === 10 && (
                        <div className="flex items-center pr-4">
                          <Check className="w-4 h-4 text-[#e87920]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4a3042] leading-relaxed pl-1">
                      A 4-digit OTP will be sent via SMS to verify your number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={phoneInput.length < 10}
                    className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#e87920] to-[#d05f10] hover:from-[#f09030] hover:to-[#e87920] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200 text-white font-bold text-[15px] shadow-[0_8px_24px_rgba(232,121,32,0.3)] flex items-center justify-center gap-2.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── STEP 2: OTP ── */}
              {authStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">4-Digit Code</label>
                      <button
                        type="button"
                        onClick={() => setAuthStep("phone")}
                        className="text-[#e87920] text-[10px] font-bold uppercase tracking-wider hover:text-[#f09030]"
                      >
                        Change Number
                      </button>
                    </div>

                    {/* OTP boxes */}
                    <div className="flex justify-center gap-3">
                      {otpInput.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-box-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const newOtp = [...otpInput];
                            newOtp[index] = val;
                            setOtpInput(newOtp);
                            if (val && index < 3) {
                              document.getElementById(`otp-box-${index + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !digit && index > 0) {
                              document.getElementById(`otp-box-${index - 1}`)?.focus();
                            }
                          }}
                          autoFocus={index === 0}
                          className={`w-14 h-14 rounded-2xl border-2 text-center text-[22px] font-black text-white outline-none transition-all duration-200 ${
                            digit
                              ? "bg-[#e87920]/10 border-[#e87920] shadow-[0_0_0_3px_rgba(232,121,32,0.15)] text-[#f0b070]"
                              : "bg-[#0f0810] border-[#3a2530] focus:border-[#e87920]/60 focus:bg-[#180d14]"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-[#4a3042]">
                        {otpTimer > 0 ? (
                          <>Resend in <strong className="text-[#7a5c6a] font-bold">{otpTimer}s</strong></>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOtpTimer(30)}
                            className="text-[#e87920] font-bold hover:underline text-[10px]"
                          >
                            Resend OTP
                          </button>
                        )}
                      </span>
                      <span className="text-[10px] text-[#4a3042] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#7a5c6a]" /> Secure verification
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpInput.join("").length !== 4 || isFetchingTickets}
                    className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#e87920] to-[#d05f10] hover:from-[#f09030] hover:to-[#e87920] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200 text-white font-bold text-[15px] shadow-[0_8px_24px_rgba(232,121,32,0.3)] flex items-center justify-center gap-2.5"
                  >
                    {isFetchingTickets ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying & Checking Tickets...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── STEP 3: Profile ── */}
              {authStep === "profile" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">Full Name</label>
                    <div className="flex items-center bg-[#0f0810] rounded-2xl border border-[#3a2530] focus-within:border-[#ffb2b9]/60 focus-within:shadow-[0_0_0_3px_rgba(255,178,185,0.1)] transition-all overflow-hidden">
                      <div className="flex items-center px-4 py-4 flex-shrink-0">
                        <User className="w-4 h-4 text-[#7a5c6a]" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-transparent pr-4 py-4 text-[15px] text-white placeholder-[#3a2530] outline-none font-medium"
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-[#4a3042] leading-relaxed pl-1">
                      This name will be printed on your festival pass and checked at Gate 03.
                    </p>
                  </div>

                  <button
                    onClick={() => completeAuth(nameInput || "Guest")}
                    disabled={!nameInput.trim()}
                    className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#e87920] to-[#d05f10] hover:from-[#f09030] hover:to-[#e87920] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200 text-white font-bold text-[15px] shadow-[0_8px_24px_rgba(232,121,32,0.3)] flex items-center justify-center gap-2.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Complete &amp; Book Passes</span>
                  </button>
                </div>
              )}
           </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* COMPREHENSIVE BOOKING WINDOW (When Authenticated) */}
        {/* ------------------------------------------------------------- */}
        {isBookingWindowOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsBookingWindowOpen(false)} />

            {/* Modal card */}
            <div className="relative w-full max-w-[394px] mx-3 bg-gradient-to-b from-[#241520] to-[#180d14] border border-[#3a2530]/80 rounded-t-[32px] md:rounded-[32px] pt-7 pb-7 px-4 shadow-[0_-24px_80px_rgba(0,0,0,0.7)] flex flex-col gap-6 max-h-[92vh] overflow-y-auto no-scrollbar text-left">
              {/* Drag pill (mobile) */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#3a2530] md:hidden" />

              {/* Ambient glow */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#e87920]/8 blur-[60px] rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f0bf5c] to-[#bc9032] flex items-center justify-center shadow-lg shadow-[#f0bf5c]/25 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[18px] font-bold text-white leading-tight">
                      {isBookingSuccess ? "Booking Confirmed!" : "Select Pass & Add-ons"}
                    </h3>
                    <p className="text-[11px] font-bold text-[#7a5c6a] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#e87920]" />
                      Verified Checkout • {currentUser?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingWindowOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#2e1b27] hover:bg-[#3f2535] border border-[#3a2530] flex items-center justify-center text-[#7a5c6a] hover:text-white transition-all flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isBookingSuccess ? (
                <div className="flex flex-col gap-5">
                  
                  {/* Step 1 & 2: Pass & Date Row */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">Pass Category</label>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsBookingWindowOpen(false);
                          setActiveTab("discover");
                          setTimeout(() => {
                            const element = document.getElementById('ticket-passes');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                        className="text-[#7a5c6a] hover:text-[#e87920] transition-colors p-1 -mr-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex bg-[#0f0810] p-1 rounded-2xl border border-[#3a2530]">
                      {[
                        { id: "general", label: TICKET_TIERS.general.label, price: `₹${TICKET_TIERS.general.price}` },
                        { id: "season", label: TICKET_TIERS.season.label, price: `₹${TICKET_TIERS.season.price}` },
                        { id: "vip", label: TICKET_TIERS.vip.label, price: `₹${TICKET_TIERS.vip.price}` }
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setBookingPassType(tier.id as any)}
                          className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 flex flex-col items-center gap-0.5 ${
                            bookingPassType === tier.id
                              ? "bg-[#3a2530] text-white shadow-sm"
                              : "text-[#7a5c6a] hover:text-[#a58c7d]"
                          }`}
                        >
                          <span>{tier.label}</span>
                          <span className={bookingPassType === tier.id ? "text-[#e87920]" : "text-[#564337]"}>{tier.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">Festival Date</label>
                      <div className="h-[46px] bg-[#0f0810] rounded-2xl border border-[#3a2530] flex items-center px-4 gap-2 overflow-hidden">
                        <Calendar className="w-4 h-4 text-[#e87920] flex-shrink-0" />
                        <span className="text-[13px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">16 Oct 2026</span>
                      </div>
                    </div>
                    
                    <div className="w-[110px] flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em] text-center">Quantity</label>
                      <div className="h-[46px] bg-[#0f0810] rounded-2xl border border-[#3a2530] flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() => setBookingQty((prev) => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-xl bg-[#241520] flex items-center justify-center text-[#7a5c6a] hover:text-white hover:bg-[#3a2530] transition-colors flex-shrink-0"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[14px] font-bold text-white px-2">{bookingQty}</span>
                        <button
                          type="button"
                          onClick={() => setBookingQty((prev) => Math.min(10, prev + 1))}
                          className="w-8 h-8 rounded-xl bg-[#241520] flex items-center justify-center text-[#7a5c6a] hover:text-white hover:bg-[#3a2530] transition-colors flex-shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Festival Experience Add-ons */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">Festive Add-ons (Optional)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Add-on 1: Basic Dandiya */}
                      <button
                        type="button"
                        onClick={() => setAddOnDandiya1(!addOnDandiya1)}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-between text-center gap-1.5 transition-all duration-200 cursor-pointer touch-manipulation h-[100px] ${
                          addOnDandiya1
                            ? "bg-[#e87920]/10 border-[#e87920] shadow-[0_0_0_1px_rgba(232,121,32,0.3)]"
                            : "bg-[#0f0810] border-[#3a2530] hover:border-[#7a5c6a]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden border ${addOnDandiya1 ? "border-[#e87920]" : "border-[#3a2530]"}`}>
                          <img src="/dandiya1.jpg" alt="Basic Dandiya" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5 mt-0.5">
                          <span className={`text-[9px] font-bold leading-tight ${addOnDandiya1 ? "text-white" : "text-[#7a5c6a]"}`}>Basic</span>
                          <span className={`text-[10px] font-black ${addOnDandiya1 ? "text-[#e87920]" : "text-[#f0bf5c]"}`}>+₹99</span>
                        </div>
                      </button>

                      {/* Add-on 2: Rosewood Dandiya */}
                      <button
                        type="button"
                        onClick={() => setAddOnDandiya2(!addOnDandiya2)}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-between text-center gap-1.5 transition-all duration-200 cursor-pointer touch-manipulation h-[100px] ${
                          addOnDandiya2
                            ? "bg-[#e87920]/10 border-[#e87920] shadow-[0_0_0_1px_rgba(232,121,32,0.3)]"
                            : "bg-[#0f0810] border-[#3a2530] hover:border-[#7a5c6a]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden border ${addOnDandiya2 ? "border-[#e87920]" : "border-[#3a2530]"}`}>
                          <img src="/dandiya2.jpg" alt="Rosewood Dandiya" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5 mt-0.5">
                          <span className={`text-[9px] font-bold leading-tight ${addOnDandiya2 ? "text-white" : "text-[#7a5c6a]"}`}>Rosewood</span>
                          <span className={`text-[10px] font-black ${addOnDandiya2 ? "text-[#e87920]" : "text-[#f0bf5c]"}`}>+₹199</span>
                        </div>
                      </button>

                      {/* Add-on 3: Neon LED Dandiya */}
                      <button
                        type="button"
                        onClick={() => setAddOnDandiya3(!addOnDandiya3)}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-between text-center gap-1.5 transition-all duration-200 cursor-pointer touch-manipulation h-[100px] ${
                          addOnDandiya3
                            ? "bg-[#e87920]/10 border-[#e87920] shadow-[0_0_0_1px_rgba(232,121,32,0.3)]"
                            : "bg-[#0f0810] border-[#3a2530] hover:border-[#7a5c6a]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden border ${addOnDandiya3 ? "border-[#e87920]" : "border-[#3a2530]"}`}>
                          <img src="/dandiya3.jpg" alt="Neon Dandiya" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5 mt-0.5">
                          <span className={`text-[9px] font-bold leading-tight ${addOnDandiya3 ? "text-white" : "text-[#7a5c6a]"}`}>Neon LED</span>
                          <span className={`text-[10px] font-black ${addOnDandiya3 ? "text-[#e87920]" : "text-[#f0bf5c]"}`}>+₹299</span>
                        </div>
                      </button>

                      {/* Add-on 4: Metal Dandiya */}
                      <button
                        type="button"
                        onClick={() => setAddOnDandiya4(!addOnDandiya4)}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-between text-center gap-1.5 transition-all duration-200 cursor-pointer touch-manipulation h-[100px] ${
                          addOnDandiya4
                            ? "bg-[#e87920]/10 border-[#e87920] shadow-[0_0_0_1px_rgba(232,121,32,0.3)]"
                            : "bg-[#0f0810] border-[#3a2530] hover:border-[#7a5c6a]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden border ${addOnDandiya4 ? "border-[#e87920]" : "border-[#3a2530]"}`}>
                          <img src="/dandiya4.jpg" alt="Metal Dandiya" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5 mt-0.5">
                          <span className={`text-[9px] font-bold leading-tight ${addOnDandiya4 ? "text-white" : "text-[#7a5c6a]"}`}>Pro Metal</span>
                          <span className={`text-[10px] font-black ${addOnDandiya4 ? "text-[#e87920]" : "text-[#f0bf5c]"}`}>+₹399</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Step 5: Payment Method */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[10px] font-bold text-[#7a5c6a] uppercase tracking-[0.15em]">Payment Method</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { 
                          id: "gpay", 
                          label: "GPay", 
                          icon: (
                            <svg viewBox="0 0 32 32" className="w-7 h-7 drop-shadow-sm">
                              <circle cx="16" cy="16" r="16" fill="#fff"/>
                              <path d="M22.5 16.3c0-.4 0-.9-.1-1.3h-6.2v2.5h3.6c-.1.7-.5 1.3-1.1 1.7v1.4h1.8c1-1 1.6-2.5 1.6-4.3z" fill="#4285F4"/>
                              <path d="M16.2 22.6c1.8 0 3.3-.6 4.4-1.6l-1.8-1.4c-.6.4-1.4.6-2.5.6-1.9 0-3.6-1.3-4.2-3.1h-1.9v1.5c1.1 2.3 3.5 3.9 6 3.9z" fill="#34A853"/>
                              <path d="M12 17.1c-.2-.5-.2-1.1-.2-1.6 0-.6.1-1.1.2-1.6v-1.5h-1.9c-.4.8-.6 1.7-.6 2.6s.2 1.8.6 2.6l1.9-1.5z" fill="#FBBC05"/>
                              <path d="M16.2 9.4c1 0 1.9.3 2.6.9l1.9-1.9c-1.2-1.1-2.7-1.7-4.5-1.7-2.6 0-4.9 1.5-6 3.9l1.9 1.5c.6-1.8 2.3-3.1 4.1-3.1z" fill="#EA4335"/>
                            </svg>
                          ) 
                        },
                        { 
                          id: "phonepe", 
                          label: "PhonePe", 
                          icon: (
                            <svg viewBox="0 0 32 32" className="w-7 h-7 drop-shadow-sm">
                              <circle cx="16" cy="16" r="16" fill="#5F259F"/>
                              <path d="M11 14.5c0-1.8.8-3.1 2.1-3.1h5.8v2.4h-5.8v1.7h4c1.9 0 3.3 1.1 3.3 3 0 1.9-1.3 3-3.3 3h-2v4h-2.5v-6h1.9c1 0 1.4-.4 1.4-1 0-.6-.5-1-1.4-1h-3.5v-3z" fill="#fff"/>
                            </svg>
                          )
                        },
                        { 
                          id: "paytm", 
                          label: "Paytm", 
                          icon: (
                            <svg viewBox="0 0 32 32" className="w-7 h-7 drop-shadow-sm">
                              <circle cx="16" cy="16" r="16" fill="#002E6E"/>
                              <path d="M9 13.5h3.6c1.6 0 2.4.8 2.4 2 0 1.2-.8 2-2.4 2H11v3.5H9v-7.5zm2 2.5h1.3c.4 0 .6-.2.6-.5 0-.4-.2-.5-.6-.5H11v1zM16 13.5h2v6h-2v-6z" fill="#00BAF2"/>
                            </svg>
                          )
                        },
                        { 
                          id: "card", 
                          label: "Card", 
                          icon: (
                            <div className="w-7 h-7 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full flex items-center justify-center drop-shadow-sm">
                              <CreditCard className="w-4 h-4 text-slate-800" />
                            </div>
                          )
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPaymentMethod(item.id as "gpay" | "phonepe" | "paytm" | "card")}
                          className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer touch-manipulation ${
                            paymentMethod === item.id
                              ? "bg-[#e87920]/10 border-[#e87920] shadow-[0_0_0_1px_rgba(232,121,32,0.3)]"
                              : "bg-[#0f0810] border-[#3a2530] hover:border-[#7a5c6a]"
                          }`}
                        >
                          <span className="pointer-events-none">{item.icon}</span>
                          <span className={`text-[10px] font-bold pointer-events-none ${paymentMethod === item.id ? "text-white" : "text-[#7a5c6a]"}`}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Calculation Breakdown */}
                  <div className="p-4 rounded-2xl bg-[#0f0810] border border-[#3a2530] flex flex-col gap-2 mt-1">
                    <div className="flex justify-between items-center text-[12px] text-[#a58c7d]">
                      <span>{bookingQty} × {bookingPassType.toUpperCase()} Pass</span>
                      <span className="font-semibold text-white">₹{(basePassPrice * bookingQty).toLocaleString("en-IN")}</span>
                    </div>
                    {addOnDandiya1 && (
                      <div className="flex justify-between items-center text-[12px] text-[#a58c7d]">
                        <span>{bookingQty} × Basic Dandiya</span>
                        <span className="font-semibold text-white">₹{dandiya1Cost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {addOnDandiya2 && (
                      <div className="flex justify-between items-center text-[12px] text-[#a58c7d]">
                        <span>{bookingQty} × Rosewood Dandiya</span>
                        <span className="font-semibold text-white">₹{dandiya2Cost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {addOnDandiya3 && (
                      <div className="flex justify-between items-center text-[12px] text-[#a58c7d]">
                        <span>{bookingQty} × Neon LED Dandiya</span>
                        <span className="font-semibold text-white">₹{dandiya3Cost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {addOnDandiya4 && (
                      <div className="flex justify-between items-center text-[12px] text-[#a58c7d]">
                        <span>{bookingQty} × Pro Metal Dandiya</span>
                        <span className="font-semibold text-white">₹{dandiya4Cost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px] text-[#10b981]">
                      <span>Festive GST Exemption</span>
                      <span>₹0</span>
                    </div>
                    
                    <div className="w-full h-px bg-[#3a2530] my-1" />
                    
                    <div className="flex justify-between items-end pt-1">
                      <span className="text-[13px] font-bold text-white">Total Payable</span>
                      <span className="text-[24px] font-black text-[#e87920] leading-none">₹{bookingTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Pay & Confirm CTA */}
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#e87920] to-[#d05f10] hover:from-[#f09030] hover:to-[#e87920] active:scale-[0.97] transition-all duration-200 text-white font-bold text-[15px] shadow-[0_8px_24px_rgba(232,121,32,0.3)] flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation mt-1"
                  >
                    <span>Pay ₹{bookingTotal.toLocaleString("en-IN")} &amp; Confirm Passes</span>
                  </button>
                </div>
              ) : (
                /* Booking Success View */
                <div className="py-6 flex flex-col items-center text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-[#bc9032]/20 border-2 border-[#f0bf5c] flex items-center justify-center text-[#f0bf5c] shadow-lg shadow-[#f0bf5c]/20 animate-bounce">
                    <CheckCircle className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#f0bf5c] uppercase tracking-widest">
                      FESTIVAL PASS ISSUED
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-0.5">Booking Confirmed!</h3>
                    <p className="text-xs text-[#ddc1b1] mt-1 max-w-xs mx-auto">
                      Congratulations {currentUser?.name}! Your passes have been added to your wallet. You will also
                      receive an SMS receipt at {currentUser?.phone}.
                    </p>
                  </div>

                  {/* Summary Card */}
                  {lastBookedPass && (
                    <div className="w-full p-4 rounded-2xl bg-[#1c0f18] border border-[#f0bf5c]/40 text-left space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#f0bf5c]">{lastBookedPass.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                          PAID ₹{lastBookedPass.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm">{lastBookedPass.title}</p>
                      <p className="text-[#ddc1b1]">{lastBookedPass.date}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBookingWindowOpen(false);
                        setActiveTab("my-pass");
                      }}
                      className="w-full h-11 rounded-full bg-[#f0bf5c] hover:bg-[#ffdea4] text-[#412d00] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                    >
                      <QrCode className="w-4 h-4 pointer-events-none" />
                      <span className="pointer-events-none">View Pass in Ticket Wallet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBookingWindowOpen(false)}
                      className="w-full h-10 rounded-full bg-[#34262f] text-[#ddc1b1] hover:text-white text-xs font-semibold cursor-pointer touch-manipulation"
                    >
                      <span className="pointer-events-none">Back to Festival Discover</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}