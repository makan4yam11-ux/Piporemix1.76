export type Language = 'en' | 'id' | 'zh' | 'hi' | 'es' | 'fr' | 'ar' | 'bn' | 'ru' | 'pt';

export interface Translations {
  common: {
    user: string;
    enabled: string;
    disabled: string;
    save: string;
    cancel: string;
    add: string;
    delete: string;
  };
  nav: {
    home: string;
    todos: string;
    calendar: string;
    reminders: string;
    journal: string;
    account: string;
    chat: string;
  };
  chat: {
    greeting: string;
    subtitle: string;
    placeholder: string;
    pipoNote: string;
    advice: string[];
  };
  todo: {
    title: string;
    all: string;
    categories: {
      easy: string;
      fun: string;
      important: string;
      helping: string;
      free: string;
    };
    hints: {
      easy: string;
      fun: string;
      important: string;
      helping: string;
      free: string;
      nice: string;
    };
    tags: {
      easy: string;
      fun: string;
      important: string;
      kind: string;
      short: string;
    };
    taskHints: {
      brushTeeth: string;
      drinkWater: string;
      playOutside: string;
      helpSomeone: string;
      homework: string;
      draw: string;
      listenMusic: string;
      rest: string;
    };
  };
  reminders: {
    title: string;
    placeholder: string;
    optional: string;
    today: string;
    tomorrow: string;
  };
  auth: {
    signIn: string;
    createAccount: string;
    signUpPrompt: string;
    signInPrompt: string;
    username: string;
    password: string;
    confirmPassword: string;
    setupComplete: string;
    welcome: string;
    setupFailed: string;
    passwordsNoMatch: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    today: string;
    selectView: string;
    viewList: string;
    viewDaily: string;
    viewMonthly: string;
    viewYearly: string;
    selectDate: string;
    selectDay: string;
    addEvent: string;
    editEvent: string;
    eventName: string;
    eventDescription: string;
    startTime: string;
    endTime: string;
    allDay: string;
    location: string;
    color: string;
    remindMe: string;
    noEvents: string;
    noEventsDesc: string;
    events: string;
    upcoming: string;
    timeParseSuccess: string;
    timeParseNeedsClarification: string;
    timeParseError: string;
    timeParseFailure: string;
    deleteConfirm: string;
    sun: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    lessonsEvents: string;
    titleLabel: string;
    descriptionLabel: string;
    startTimeLabel: string;
    endTimeLabel: string;
    locationLabel: string;
  };
  account: {
    title: string;
    subtitle: string;
    journalingSince: string;
    journalEntries: string;
    settings: string;
    language: string;
    pipoCheckins: string;
    daily: string;
    voiceRecording: string;
    calendarSync: string;
    google: string;
    fixedTimeMode: string;
    fixedTimeModeDesc: string;
    themeColors: string;
    logout: string;
    pipoNoteTitle: string;
    pipoNoteMessage: string;
    daysSpent: string;
    guestAccount: string;
    syncWithGoogle: string;
    guestDesc: string;
    syncDesc: string;
    signedIn: string;
    signOut: string;
    changePfp: string;
    uploading: string;
    darkMode: string;
    switchDark: string;
    primaryColor: string;
    mainTheme: string;
    accentColor: string;
    highlights: string;
    resetDefault: string;
    customizeProfile: string;
    customizePfpDesc: string;
    notNow: string;
    success: string;
    pfpUpdated: string;
    error: string;
    todayBoard: string;
    todayBegins: string;
    dailyCheckIn: string;
    close: string;
  };
  mainMenu: {
    todos: string;
    reminders: string;
    calendar: string;
    journal: string;
    settings: string;
    chat: string;
    shop: string;
  };
  promo: {
    offer: string;
    title: string;
    description: string;
    checkItOut: string;
    maybeLater: string;
  };
  whatsNew: {
    title: string;
    gotIt: string;
    calendarView: string;
    calendarViewDesc: string;
    autoTime: string;
    autoTimeDesc: string;
  };
  guest: {
    greeting: string;
    description: string;
    button: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      user: "User",
      enabled: "Enabled",
      disabled: "Disabled",
      save: "Save",
      cancel: "Cancel",
      add: "Add",
      delete: "Delete",
    },
    nav: {
      home: "Home",
      todos: "To-Dos",
      calendar: "Calendar",
      reminders: "Reminders",
      journal: "Journal",
      account: "Account",
      chat: "Chat",
    },
    chat: {
      greeting: "Hi there! 👋",
      subtitle: "I'll quickly create anything you have in mind.",
      placeholder: "Say what's on your mind...",
      pipoNote: "I'm always here when you need to talk or plan your day. Take your time! You can return anytime.",
      advice: [
        "You can change this later",
        "Nothing here is wrong",
        "You don't have to finish",
        "Take your time"
      ]
    },
    todo: {
      title: "To-Dos",
      all: "All",
      categories: {
        easy: "Easy Things",
        fun: "Fun Things",
        important: "Important Things",
        helping: "Helping Others",
        free: "Free Play"
      },
      hints: {
        easy: "Fun and quick 🎈",
        fun: "Feels fresh ✨",
        important: "Good for your body 💪",
        helping: "Kind and helpful 💖",
        free: "Your time 🎮",
        nice: "Nice"
      },
      tags: {
        easy: "Easy",
        fun: "Fun",
        important: "Important",
        kind: "Kind",
        short: "Short"
      },
      taskHints: {
        brushTeeth: "Fresh start",
        drinkWater: "Feels good",
        playOutside: "Fun",
        helpSomeone: "Kind",
        homework: "Short",
        draw: "Creative",
        listenMusic: "Relaxing",
        rest: "Peaceful"
      }
    },
    reminders: {
      title: "Reminders",
      placeholder: "Drink some water",
      optional: "Optional...",
      today: "Today",
      tomorrow: "Tomorrow"
    },
    auth: {
      signIn: "Sign In",
      createAccount: "Create Account",
      signUpPrompt: "Don't have an account? Sign up",
      signInPrompt: "Already have an account? Sign in",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      setupComplete: "Setup Complete",
      welcome: "Welcome to Pipo's Room!",
      setupFailed: "Setup Failed",
      passwordsNoMatch: "Passwords do not match"
    },
    calendar: {
      title: "Calendar",
      subtitle: "Plan your day and track events",
      today: "Today",
      selectView: "Select View",
      viewList: "List View",
      viewDaily: "Daily View",
      viewMonthly: "Monthly View",
      viewYearly: "Yearly View",
      selectDate: "Select Date",
      selectDay: "Select Day",
      addEvent: "Add Event",
      editEvent: "Edit Event",
      eventName: "Event Name",
      eventDescription: "Description",
      startTime: "Start Time",
      endTime: "End Time",
      allDay: "All Day",
      location: "Location",
      color: "Color",
      remindMe: "Remind Me",
      noEvents: "No events for this day",
      noEventsDesc: "Add a new event to get started",
      events: "Events",
      upcoming: "Upcoming Events",
      timeParseSuccess: "I've added that to your calendar!",
      timeParseNeedsClarification: "Could you clarify the time for that event?",
      timeParseError: "I'm having trouble understanding that time expression.",
      timeParseFailure: "I couldn't create that event. Please try again.",
      deleteConfirm: "Are you sure you want to delete this event?",
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      lessonsEvents: "Lessons & Events",
      titleLabel: "Title",
      descriptionLabel: "Description",
      startTimeLabel: "Start Time",
      endTimeLabel: "End Time",
      locationLabel: "Location",
    },
    account: {
      title: "Profile Page",
      subtitle: "Your personal space",
      journalingSince: "Journaling since",
      journalEntries: "Journal Entries",
      settings: "Settings",
      language: "Language",
      pipoCheckins: "Pipo Check-ins",
      daily: "Daily",
      voiceRecording: "Voice Recording",
      calendarSync: "Calendar Sync",
      google: "Google",
      fixedTimeMode: "Fixed Time Mode",
      fixedTimeModeDesc: "Use UTC time for everything",
      themeColors: "Theme Colors",
      logout: "Log Out",
      pipoNoteTitle: "A Note from Pipo",
      pipoNoteMessage: "I'm always here when you need to talk or plan your day. Take your time! You can return anytime.",
      daysSpent: "Days Spent With Pipo",
      guestAccount: "Guest Account",
      syncWithGoogle: "Sync with Google",
      guestDesc: "You are using a temporary account. Sign up to save your data!",
      syncDesc: "Optional: Sign in to sync your data across devices.",
      signedIn: "Signed In",
      signOut: "Sign Out",
      changePfp: "Change Profile Picture",
      uploading: "Uploading...",
      darkMode: "Dark Mode",
      switchDark: "Switch to dark theme",
      primaryColor: "Primary Color",
      mainTheme: "Main theme color",
      accentColor: "Accent Color",
      highlights: "Highlights and badges",
      resetDefault: "Reset to Default",
      customizeProfile: "Customize Your Profile",
      customizePfpDesc: "To customize your profile and upload a picture, you'll need to sign up or log in to a permanent account first.",
      notNow: "Not now",
      success: "Success",
      pfpUpdated: "Profile picture updated!",
      error: "Error",
      todayBoard: "Today Board",
      todayBegins: "this is where today begins",
      dailyCheckIn: "Daily Check-in",
      close: "Close",
    },
    mainMenu: {
      todos: "To-Dos",
      reminders: "Reminders",
      calendar: "Calendar",
      journal: "Photo Journal",
      settings: "Settings",
      chat: "Chat with Pipo",
      shop: "Shop",
    },
    promo: {
      offer: "SPECIAL OFFER",
      title: "Premium Penguin Plan",
      description: "Get exclusive Pipo themes and unlimited cloud storage for your journals.",
      checkItOut: "Check it out",
      maybeLater: "Maybe later",
    },
    whatsNew: {
      title: "WHAT'S NEW",
      gotIt: "Got it!",
      calendarView: "New Calendar View",
      calendarViewDesc: "Select dates easily with the new icon in your photo journal.",
      autoTime: "Auto-Time Tracking",
      autoTimeDesc: "Journal entries now automatically capture your local time.",
    },
    guest: {
      greeting: "Pipo wants to know you better!",
      description: "To chat with Pipo and save your memories, please sign up or log in to a permanent account.",
      button: "Sign Up / Login",
    }
  },
  id: {
    common: {
      user: "Pengguna",
      enabled: "Aktif",
      disabled: "Nonaktif",
      save: "Simpan",
      cancel: "Batal",
      add: "Tambah",
      delete: "Hapus",
    },
    nav: {
      home: "Beranda",
      todos: "Tugas",
      calendar: "Kalender",
      reminders: "Pengingat",
      journal: "Jurnal",
      account: "Akun",
      chat: "Obrolan",
    },
    chat: {
      greeting: "Halo! 👋",
      subtitle: "Aku akan bantu buat apa pun yang kamu mau.",
      placeholder: "Katakan apa yang ada di pikiranmu...",
      pipoNote: "Aku selalu ada saat kamu butuh teman bicara atau merencanakan harimu. Tenang saja! Kamu bisa kembali kapan pun.",
      advice: [
        "Kamu bisa mengubah ini nanti",
        "Tidak ada yang salah di sini",
        "Kamu tidak harus menyelesaikannya",
        "Santai saja"
      ]
    },
    todo: {
      title: "Tugas",
      all: "Semua",
      categories: {
        easy: "Hal Mudah",
        fun: "Hal Seru",
        important: "Hal Penting",
        helping: "Membantu Sesama",
        free: "Waktu Bebas"
      },
      hints: {
        easy: "Seru dan cepat 🎈",
        fun: "Terasa segar ✨",
        important: "Bagus untuk tubuhmu 💪",
        helping: "Baik dan membantu 💖",
        free: "Waktumu 🎮",
        nice: "Bagus"
      },
      tags: {
        easy: "Mudah",
        fun: "Seru",
        important: "Penting",
        kind: "Baik",
        short: "Singkat"
      },
      taskHints: {
        brushTeeth: "Awal yang segar",
        drinkWater: "Terasa enak",
        playOutside: "Seru",
        helpSomeone: "Baik",
        homework: "Singkat",
        draw: "Kreatif",
        listenMusic: "Santai",
        rest: "Tenang"
      }
    },
    reminders: {
      title: "Pengingat",
      placeholder: "Minum air",
      optional: "Opsional...",
      today: "Hari Ini",
      tomorrow: "Besok"
    },
    auth: {
      signIn: "Masuk",
      createAccount: "Buat Akun",
      signUpPrompt: "Belum punya akun? Daftar",
      signInPrompt: "Sudah punya akun? Masuk",
      username: "Nama Pengguna",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      setupComplete: "Pengaturan Selesai",
      welcome: "Selamat datang di Kamar Pipo!",
      setupFailed: "Pengaturan Gagal",
      passwordsNoMatch: "Kata sandi tidak cocok"
    },
    calendar: {
      title: "Kalender",
      subtitle: "Rencanakan harimu dan pantau agenda",
      today: "Hari Ini",
      selectView: "Pilih Tampilan",
      viewList: "Tampilan Daftar",
      viewDaily: "Tampilan Harian",
      viewMonthly: "Tampilan Bulanan",
      viewYearly: "Tampilan Tahunan",
      selectDate: "Pilih Tanggal",
      selectDay: "Pilih Hari",
      addEvent: "Tambah Agenda",
      editEvent: "Ubah Agenda",
      eventName: "Nama Agenda",
      eventDescription: "Deskripsi",
      startTime: "Waktu Mulai",
      endTime: "Waktu Selesai",
      allDay: "Sepanjang Hari",
      location: "Lokasi",
      color: "Warna",
      remindMe: "Ingatkan Saya",
      noEvents: "Tidak ada agenda hari ini",
      noEventsDesc: "Tambah agenda baru untuk memulai",
      events: "Agenda",
      upcoming: "Agenda Mendatang",
      timeParseSuccess: "Sudah aku tambahkan ke kalendermu!",
      timeParseNeedsClarification: "Bisa jelaskan kapan waktu agenda tersebut?",
      timeParseError: "Aku kesulitan memahami keterangan waktu itu.",
      timeParseFailure: "Aku tidak bisa membuat agenda tersebut. Coba lagi ya.",
      deleteConfirm: "Kamu yakin ingin menghapus agenda ini?",
      sun: "Min",
      mon: "Sen",
      tue: "Sel",
      wed: "Rab",
      thu: "Kam",
      fri: "Jum",
      sat: "Sab",
      lessonsEvents: "Pelajaran & Agenda",
      titleLabel: "Judul",
      descriptionLabel: "Deskripsi",
      startTimeLabel: "Waktu Mulai",
      endTimeLabel: "Waktu Selesai",
      locationLabel: "Lokasi",
    },
    account: {
      title: "Halaman Profil",
      subtitle: "Ruang pribadimu",
      journalingSince: "Menulis jurnal sejak",
      journalEntries: "Entri Jurnal",
      settings: "Pengaturan",
      language: "Bahasa",
      pipoCheckins: "Check-in Pipo",
      daily: "Harian",
      voiceRecording: "Rekaman Suara",
      calendarSync: "Sinkronisasi Kalender",
      google: "Google",
      fixedTimeMode: "Mode Waktu Tetap",
      fixedTimeModeDesc: "Gunakan waktu UTC untuk semuanya",
      themeColors: "Warna Tema",
      logout: "Keluar",
      pipoNoteTitle: "Catatan dari Pipo",
      pipoNoteMessage: "Aku selalu ada saat kamu butuh teman bicara atau merencanakan harimu. Tenang saja! Kamu bisa kembali kapan pun.",
      daysSpent: "Hari Bersama Pipo",
      guestAccount: "Akun Tamu",
      syncWithGoogle: "Sinkronkan dengan Google",
      guestDesc: "Kamu menggunakan akun sementara. Daftar untuk menyimpan datamu!",
      syncDesc: "Opsional: Masuk untuk menyinkronkan data di semua perangkat.",
      signedIn: "Sudah Masuk",
      signOut: "Keluar",
      changePfp: "Ubah Foto Profil",
      uploading: "Mengunggah...",
      darkMode: "Mode Gelap",
      switchDark: "Beralih ke tema gelap",
      primaryColor: "Warna Utama",
      mainTheme: "Warna tema utama",
      accentColor: "Warna Aksen",
      highlights: "Sorotan dan lencana",
      resetDefault: "Atur Ulang ke Default",
      customizeProfile: "Sesuaikan Profil Anda",
      customizePfpDesc: "Untuk menyesuaikan profil dan mengunggah foto, Anda harus mendaftar atau masuk ke akun permanen terlebih dahulu.",
      notNow: "Nanti saja",
      success: "Berhasil",
      pfpUpdated: "Foto profil diperbarui!",
      error: "Kesalahan",
      todayBoard: "Papan Hari Ini",
      todayBegins: "di sinilah hari dimulai",
      dailyCheckIn: "Check-in Harian",
      close: "Tutup",
    },
    mainMenu: {
      todos: "Tugas",
      reminders: "Pengingat",
      calendar: "Kalender",
      journal: "Jurnal Foto",
      settings: "Pengaturan",
      chat: "Chat dengan Pipo",
      shop: "Toko",
    },
    promo: {
      offer: "PENAWARAN KHUSUS",
      title: "Paket Premium Penguin",
      description: "Dapatkan tema Pipo eksklusif dan penyimpanan awan tak terbatas untuk jurnalmu.",
      checkItOut: "Lihat Sekarang",
      maybeLater: "Mungkin nanti",
    },
    whatsNew: {
      title: "YANG BARU",
      gotIt: "Mengerti!",
      calendarView: "Tampilan Kalender Baru",
      calendarViewDesc: "Pilih tanggal dengan mudah menggunakan ikon baru di jurnal fotomu.",
      autoTime: "Pelacakan Waktu Otomatis",
      autoTimeDesc: "Entri jurnal sekarang secara otomatis mencatat waktu lokalmu.",
    },
    guest: {
      greeting: "Pipo ingin mengenalmu lebih baik!",
      description: "Untuk mengobrol dengan Pipo dan menyimpan kenanganmu, silakan daftar atau masuk ke akun permanen.",
      button: "Daftar / Masuk",
    }
  },
  zh: {} as Translations,
  hi: {} as Translations,
  es: {} as Translations,
  fr: {} as Translations,
  ar: {} as Translations,
  bn: {} as Translations,
  ru: {} as Translations,
  pt: {} as Translations,
};

// Fill in other languages with English as fallback for now
const otherLanguages: Language[] = ['zh', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt'];
otherLanguages.forEach(lang => {
  translations[lang] = JSON.parse(JSON.stringify(translations.en));
});

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}
