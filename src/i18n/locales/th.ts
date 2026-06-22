import type { Messages } from "../types";

export const th: Messages = {
  brand: { subtitle: "ตัวเพิ่มประสิทธิภาพ" },
  nav: {
    performance: "ประสิทธิภาพ",
    tools: "เครื่องมือ",
    overview: "ภาพรวม",
    scanner: "สแกนเนอร์",
    tweaks: "ปรับแต่ง",
    boost: "บูสต์",
    cleaner: "ล้างระบบ",
    rollback: "ย้อนกลับ",
    games: "เกม",
    network: "เครือข่าย",
    settings: "ตั้งค่า",
  },
  common: {
    admin: "แอดมิน",
    restart: "รีสตาร์ท",
    restorePoint: "จุดคืนค่า",
    advisor: "ที่ปรึกษา",
    openGuide: "เปิดคู่มือ",
    active: "เปิดอยู่",
    live: "สด",
    syncing: "กำลังซิงก์…",
    save: "บันทึกการตั้งค่า",
    saved: "บันทึกแล้ว!",
    more: "เพิ่มเติม",
    risk: "ความเสี่ยง",
  },
  risk: { safe: "ปลอดภัย", medium: "ปานกลาง", high: "สูง", extreme: "สูงสุด" },
  categories: {
    windows: "Windows",
    gpu: "การ์ดจอ",
    cpu: "ซีพียู",
    network: "เครือข่าย",
    advanced: "ขั้นสูง",
  },
  pages: {
    overview: {
      title: "ภาพรวมระบบ",
      subtitle: "ล็อกอินเป็น {user} · มอนิเตอร์ประสิทธิภาพ Windows",
      performanceIndex: "ดัชนีประสิทธิภาพ",
      performanceDesc: "จาก power plan, โหมดเกม และความจำ",
      tweaksActive: "เปิด {active}/{total} การปรับแต่ง",
      score: "คะแนน",
    },
    tweaks: {
      title: "ปรับแต่ง",
      subtitle: "เปิด/ปิดการปรับแต่งทีละรายการ — แต่ละรายการแสดงระดับความเสี่ยง",
      advancedWarn:
        "โซนขั้นสูง — คล็อก GPU, พัดลม และความปลอดภัยอาจทำให้ไม่เสถียร สร้างจุดคืนค่าก่อนเสมอ",
      bundleHint: "อยากได้ชุดเดียวจบ?",
      bundleLink: "ไปที่ Boost presets →",
    },
    boost: {
      title: "บูสต์",
      subtitle: "ชุดปรับแต่งกดครั้งเดียว — มีผลกับระบบจริงเมื่อรันแอปเดสก์ท็อป",
      openTweaks: "เปิดปรับแต่ง",
    },
    settings: {
      title: "ตั้งค่า",
      subtitle: "นโยบายความปลอดภัย ภาษา และการตั้งค่าแอป",
      language: "ภาษา",
      languageDesc: "สลับอินเทอร์เฟซทั้งหมดระหว่างไทยและอังกฤษ",
      restoreBefore: "จุดคืนค่าก่อนบูสต์",
      restoreBeforeDesc: "ถามสร้าง Windows restore point ก่อน Competitive/Extreme boost",
      confirmRisk: "ยืนยันการปรับแต่งเสี่ยงสูง",
      confirmRiskDesc: "แสดงยืนยันเพิ่มสำหรับ Extreme boost และการปรับแต่งอันตราย",
      runtime: "รันไทม์",
      data: "ข้อมูล",
      footer:
        "FPS Unleashed v0.1.0 · รันในฐานะผู้ดูแลระบบสำหรับ registry, services และ restore point",
      desktop: "เดสก์ท็อป (Tauri)",
      browser: "พรีวิวเบราว์เซอร์ — รัน `pnpm tauri dev` สำหรับฟีเจอร์เต็ม",
    },
    scanner: { title: "สแกนเนอร์", subtitle: "สแกนระบบหาโอกาสปรับประสิทธิภาพ" },
    cleaner: { title: "ล้างระบบ", subtitle: "เพิ่มพื้นที่ดิสก์และล้างแคช" },
    rollback: { title: "ย้อนกลับ", subtitle: "ย้อนการปรับแต่งและจุดคืนค่า" },
    games: { title: "เกม", subtitle: "เกมที่ติดตั้งและโปรไฟล์เปิดเกม" },
    network: {
      title: "เครือข่าย",
      subtitle: "เครื่องมือล่าช้า — ล้าง DNS, ปรับ adapter และทดสอบ ping",
    },
  },
  tweaks: {
    "win-game-mode": {
      name: "เปิดโหมดเกม",
      desc: "ให้ความสำคัญกับโปรเซสเกมและลดการรบกวนจากพื้นหลัง",
    },
    "win-power-high": {
      name: "แผนพลังงาน High Performance",
      desc: "สลับเป็น High Performance ให้ CPU/GPU ตอบสนองเร็ว",
    },
    "win-visual-fx": {
      name: "ปิด Visual Effects",
      desc: "ปิดแอนิเมชันและความโปร่งใสเพื่อลดภาระ CPU/GPU",
    },
    "win-game-dvr": {
      name: "ปิด Xbox Game Bar DVR",
      desc: "หยุดการบันทึกพื้นหลังที่กิน FPS และเพิ่ม input lag",
    },
    "win-telemetry": {
      name: "ปิดบริการ Telemetry",
      desc: "ลดบริการเก็บข้อมูลพื้นหลังระหว่างเล่นเกม",
    },
    "win-fullscreen-opt": {
      name: "ปิด Fullscreen Optimizations",
      desc: "อาจลด input lag ในบางเกม แต่อาจเกิด tearing",
    },
    "win-bg-apps": {
      name: "จำกัดแอปพื้นหลัง",
      desc: "ป้องกันแอป UWP ที่ไม่จำเป็นทำงานเบื้องหลัง",
    },
    "win-disable-power-saving": {
      name: "ปิด Power Saving ทั้งหมด",
      desc: "ประสิทธิภาพสูงสุด: CPU 100%, ปิด USB suspend, PCIe ASPM, ดิสก์ไม่ sleep, ปิด NIC power save",
    },
    "win-priority-26": {
      name: "Win32 Priority Separation (0x26)",
      desc: "โปรไฟล์ CPU สำหรับเกม — preset competitive เหมือน WinPriority (0x26)",
    },
    "win-mmcss-latency": {
      name: "โปรไฟล์ MMCSS เกม",
      desc: "System Responsiveness 0, Games task สูง, Lazy Mode timeout สูงสุด",
    },
    "win-system-ini-fps": {
      name: "โปรไฟล์ system.ini Latency",
      desc: "ใช้ [386Enh] time-slice tweaks — สำรอง system.ini ก่อน",
    },
    "gpu-shader-cache": {
      name: "ล้าง DirectX Shader Cache",
      desc: "ลบแคช shader เก่าที่ทำให้กระตุกหลังอัปเดตไดรเวอร์",
    },
    "gpu-max-perf": {
      name: "ประสิทธิภาพสูงสุด",
      desc: "ตั้ง NVIDIA/AMD ให้ใช้พลังงานสูงสุดต่อแอป",
    },
    "gpu-low-latency": {
      name: "โหมด Low Latency",
      desc: "เปิดเส้นทาง low-latency ของไดรเวอร์ (ขึ้นกับเกม)",
    },
    "gpu-hags-advisor": {
      name: "ตรวจสอบ HAGS",
      desc: "สแกน Hardware Accelerated GPU Scheduling และแนะนำตาม GPU",
    },
    "gpu-power-limit": {
      name: "จำกัดพลังงาน GPU",
      desc: "ปรับ power limit ผ่าน SDK ค่าย — ต้องมีระบบระบายความร้อนพอ",
    },
    "gpu-clock-offset": {
      name: "ออฟเซ็ตคล็อก GPU",
      desc: "ปรับ core/memory — ค่าผิดอาจทำให้เกมแครชหรือ BSOD",
    },
    "cpu-game-priority": {
      name: "ความสำคัญโปรเซสเกมสูง",
      desc: "เพิ่ม priority เกมขณะเล่น (ตาม session)",
    },
    "cpu-core-parking": {
      name: "ปิด CPU Core Parking",
      desc: "ให้ทุกคอร์ตื่นตลอด ลด latency แต่กินไฟตอน idle มากขึ้น",
    },
    "cpu-timer-res": {
      name: "Timer Resolution (เกม)",
      desc: "ขอ timer 0.5ms ขณะเล่นเกม — คืนค่าเมื่อปิดเกม",
    },
    "cpu-undervolt": {
      name: "คู่มือ CPU Undervolt",
      desc: "ที่ปรึกษาทีละขั้น — ไม่เปลี่ยนแรงดันอัตโนมัติ",
    },
    "cpu-power-limit": {
      name: "จำกัดพลังงาน CPU (PL1/PL2)",
      desc: "ห่อเครื่องมือค่าย — ต้องทดสอบความเสถียร",
    },
    "net-dns-flush": { name: "ล้าง DNS Cache", desc: "ล้างแคช DNS แก้ entry ค้าง" },
    "net-adapter-power": {
      name: "ปิด Adapter Power Saving",
      desc: "ป้องกัน NIC หลับ — ลด ping spike บน Wi-Fi/Ethernet",
    },
    "net-nagle": {
      name: "ปิด Nagle's Algorithm",
      desc: "อาจลด latency ในเกมออนไลน์บางเกม — ทดสอบก่อนเปิดค้าง",
    },
    "net-throttling": {
      name: "Network Throttling Index",
      desc: "ปรับ multimedia network throttling ลด latency",
    },
    "adv-fan-curve": {
      name: "ปรับ Fan Curve",
      desc: "ปรับพัดลมผ่านเครื่องมือค่าย — curve ผิด = ร้อนหรือเสียงดัง",
    },
    "adv-ram-standby": {
      name: "ล้าง Standby Memory",
      desc: "ล้าง standby list ตอนเล่นเกม — ใช้เมื่อ RAM ไม่พอ",
    },
    "adv-vbs-warn": {
      name: "ตรวจ VBS / Core Isolation",
      desc: "ตรวจ virtualization security และอธิบายผลต่อ FPS",
    },
    "adv-vbs-disable": {
      name: "ปิด Memory Integrity",
      desc: "อาจเพิ่ม FPS บาง CPU — ลดความปลอดภัย ไม่แนะนำใช้ประจำ",
    },
    "adv-bios-xmp": {
      name: "ที่ปรึกษา XMP / EXPO",
      desc: "ตรวจว่า RAM รันต่ำกว่าความเร็วที่ระบุ — แนะนำ BIOS เท่านั้น",
    },
  },
  boost: {
    safe: {
      name: "Safe Boost",
      tagline: "ความเสี่ยงต่ำ · แนะนำทุกคน",
      warning: "ปลอดภัยส่วนใหญ่ — แอปพื้นหลังอาจหยุดชั่วคราวขณะเล่นเกม",
    },
    competitive: {
      name: "Competitive Boost",
      tagline: "FPS + latency · สำหรับเกมเมอร์จริงจัง",
      warning:
        "ปรับ services, registry, power — Xbox Game Bar อาจหยุดบันทึก สร้าง restore point ก่อน",
    },
    extreme: {
      name: "Extreme Boost",
      tagline: "ได้สูงสุด · เสี่ยงไม่เสถียรมากขึ้น",
      warning:
        "อาจ BSOD, เกมแครช หรือเน็ตมีปัญหา — ใช้เมื่อระบบระบายความร้อนดีและมี restore point",
    },
    expert: {
      name: "Expert Guide",
      tagline: "ที่ปรึกษา BIOS/OC · ไม่ apply อัตโนมัติ",
      warning:
        "โหมดที่ปรึกษาเท่านั้น — BIOS, undervolt, OC ผิดอาจทำให้เครื่องเสีย",
    },
  },
  guides: {
    "gpu-hags-advisor": {
      title: "ตรวจสอบ HAGS",
      summary: "HAGS อาจช่วยหรือทำร้าย FPS ขึ้นกับ GPU และไดรเวอร์",
      steps: [
        "เปิด Settings → System → Display → Graphics → Default graphics settings",
        "ดู “Hardware-accelerated GPU scheduling” ว่า On หรือ Off",
        "NVIDIA RTX 20 ขึ้นไป: ลองเปิดเพื่อ latency ต่ำในเกม DX12",
        "รีสตาร์ทหลังเปลี่ยน HAGS แล้วรัน benchmark เดิมสองรอบ",
        "เลือกค่าที่ให้ 1% low ดีกว่า — ไม่ใช่แค่ FPS เฉลี่ย",
      ],
    },
    "cpu-undervolt": {
      title: "คู่มือ CPU Undervolt",
      summary: "Undervolt ลดความร้อนและอาจเพิ่ม boost — ค่าผิดทำให้แครช",
      warning: "ทีละขั้น — ถ้าเกมแครชหรือ BSOD ให้ย้อนทันที",
      steps: [
        "ดาวน์โหลดเครื่องมือ (Intel XTU, AMD Ryzen Master หรือ BIOS offset)",
        "รัน stress test 15 นาทีที่ค่า stock แล้วจดอุณหภูมิสูงสุด",
        "ลด core voltage offset −5 mV (หรือหนึ่งขั้นใน BIOS)",
        "ทดสอบเกมหรือ Cinebench เดิม — ดูแครชหรือ WHEA error",
        "ทำซ้ำทีละน้อยจนเสถียร แล้วหยุด — อย่าไล่ undervolt สูงสุด",
        "บันทึกโปรไฟล์ BIOS หรือ export ก่อนปิดเครื่องมือ",
      ],
    },
    "adv-vbs-warn": {
      title: "ตรวจ VBS / Core Isolation",
      summary: "ความปลอดภัย virtualization อาจเสีย FPS 5–15% บาง CPU — ปิดลดความปลอดภัย",
      steps: [
        "เปิด Windows Security → Device security → Core isolation details",
        "ดู Memory integrity ว่า On หรือ Off",
        "เล่นเกมหลักตอนเปิด แล้วจด FPS เฉลี่ย + 1% low",
        "ถ้า FPS ต่ำมาก พิจารณาปิด Memory integrity",
        "ปิดเมื่อยอมรับความปลอดภัยลดลง — ไม่แนะนำเครื่องใช้ประจำ",
        "รีบูตหลังเปลี่ยนแล้วทดสอบฉากเดิมเพื่อเทียบผล",
      ],
    },
    "adv-bios-xmp": {
      title: "ที่ปรึกษา XMP / EXPO",
      summary: "RAM อาจรันช้ากว่าที่ระบุถ้า XMP/EXPO ปิดใน BIOS",
      warning: "XMP/EXPO มักปลอดภัยกับ QVL RAM — โปรไฟล์ไม่เสถียรอาจบูตไม่ขึ้น",
      steps: [
        "เปิด Task Manager → Performance → Memory ดูความเร็ว (MHz)",
        "เทียบกับสติกเกอร์บนแรม (เช่น 3200, 6000)",
        "รีบูตเข้า BIOS (Del/F2) → หา XMP (Intel) หรือ EXPO (AMD)",
        "เปิด Profile 1 เท่านั้น — อย่าจูน timing เองครั้งแรก",
        "Save & exit — ถ้าบูตไม่ขึ้น clear CMOS แล้วลองโปรไฟล์ต่ำลง",
        "กลับ Windows ยืนยันความเร็วใน Task Manager และรัน memtest สั้นๆ",
      ],
    },
  },
  guideUi: {
    mode: "โหมดที่ปรึกษา",
    title: "Expert Guide Checklist",
    subtitle: "สแกนระบบจริงก่อน — ขั้นตอนที่ตรวจได้จะติ๊กอัตโนมัติเมื่อผ่าน",
    liveScan: "สแกนระบบสด",
    scanning: "กำลังสแกนระบบจริง…",
    manualSteps: "ขั้นตอนด้วยตนเอง",
    stepsCompleted: "{done}/{total} ขั้นตอนเสร็จ",
    autoVerified: "ตรวจอัตโนมัติ",
    pendingCount: "ยังมี {count} ขั้นตอนที่ตรวจแล้วยังไม่ผ่าน",
    riskWaivedBanner:
      "ยอมรับความเสี่ยงแล้ว — ข้ามการตรวจที่ยังไม่ผ่าน คุณรับผิดชอบ BIOS/undervolt เอง",
    warnBanner:
      "ขั้นตอนที่ตรวจได้จะเช็คจาก WMI/Registry อัตโนมัติ ขั้นตอนที่ตรวจไม่ได้ (stress test, reboot, BIOS) ต้องติ๊กเอง",
    waiveBtn: "ยอมรับความเสี่ยงทั้งหมด — ข้ามคู่มือ",
    waiveBtnDone: "ยอมรับความเสี่ยงแล้ว",
    saving: "กำลังบันทึก…",
    waiveConfirm:
      "ยอมรับความเสี่ยงทั้งหมด?\n\nคุณจะข้ามการตรวจขั้นตอนที่ยังไม่ผ่าน — BIOS, undervolt และความปลอดภัยอาจทำให้ระบบไม่เสถียรหรือเสียหาย\n\nบันทึกการยอมรับนี้ไว้ในเครื่อง",
    doneClear: "เสร็จสิ้น — ปิดคู่มือ",
    donePartial: "ปิดคู่มือ",
    closeConfirm:
      "ยังมีขั้นตอนที่ยังไม่ผ่านการตรวจสอบ\n\nปิดคู่มืออยู่ดีไหม? แนะนำทำขั้นตอนที่เหลือหรือกดยอมรับความเสี่ยงก่อน",
    statusVerified: "ผ่าน",
    statusPending: "รอดำเนินการ",
    statusFailed: "ไม่ผ่าน",
    statusManual: "ทำเอง",
    waitingScan: "รอผลการสแกน…",
    progress: "{verified}/{total} ตรวจผ่าน · {done}/{steps} ขั้นตอน",
    scanningProgress: "กำลังสแกน…",
    includes: "รวม {count} การปรับแต่ง",
    viewChecklist: "ดู Checklist",
    applyBoost: "ใช้ Boost",
    applying: "กำลังใช้…",
    restoreRecommended: "แนะนำสร้าง restore point ก่อนใช้",
  },
  verify: {
    hags_registry_readable: {
      verified: "อ่าน registry ได้ — HAGS เปิดอยู่",
      pending: "อ่านค่า HAGS ไม่ได้ — ตรวจใน Graphics settings",
    },
    hags_gpu_tuned: {
      verified: "GPU + HAGS ตรงคำแนะนำ",
      pending: "HAGS อาจต้องปรับสำหรับ GPU ของคุณ — เทียบ FPS",
    },
    undervolt_tool_installed: {
      verified: "พบเครื่องมือ undervolt",
      pending: "ติดตั้ง Intel XTU หรือใช้ BIOS voltage offset",
    },
    memory_integrity_readable: {
      verified: "อ่านสถานะ Memory Integrity ได้",
      pending: "เปิด Windows Security → Core isolation",
    },
    memory_integrity_gaming_choice: {
      verified: "Memory Integrity ปิดแล้ว — เหมาะกับ max gaming",
      pending: "Memory Integrity ยังเปิด — ปิดถ้าต้องการ FPS สูงสุด",
      failed: "Memory Integrity ยังเปิดอยู่",
    },
    ram_speed_readable: {
      verified: "อ่านความเร็ว RAM จากระบบได้",
      pending: "อ่านความเร็ว RAM ไม่ได้ — ดู Task Manager",
    },
    ram_speed_matches_label: {
      verified: "ความเร็วรันตรงหรือสูงกว่า rated SPD",
      pending: "เทียบ MHz ที่รันกับสติกเกอร์แรม",
      failed: "RAM ต่ำกว่า rated — เปิด XMP/EXPO ใน BIOS",
    },
    xmp_profile_enabled: {
      verified: "XMP/EXPO น่าจะเปิดแล้ว",
      pending: "เปิด XMP Profile 1 ใน BIOS",
      failed: "XMP/EXPO น่าจะยังปิด",
    },
    ram_speed_confirmed: {
      verified: "ยืนยันความเร็ว RAM ใน Windows แล้ว",
      pending: "ยืนยันความเร็วใน Task Manager หลัง BIOS",
      failed: "ความเร็วยังต่ำกว่า rated — ลอง XMP/EXPO อีกครั้ง",
    },
  },
};
