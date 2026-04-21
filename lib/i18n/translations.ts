export type Lang = "en" | "ta";

export const translations = {
  // ── Navigation ─────────────────────────────────────────────────────────────
  dashboard:       { en: "Dashboard",        ta: "டாஷ்போர்டு" },
  students:        { en: "Students",         ta: "மாணவர்கள்" },
  staff:           { en: "Staff",            ta: "பணியாளர்கள்" },
  feeManagement:   { en: "Fee Management",   ta: "கட்டண மேலாண்மை" },
  expenses:        { en: "Expenses",         ta: "செலவுகள்" },
  events:          { en: "Events & Calendar", ta: "நிகழ்வுகள் & நாட்காட்டி" },
  announcements:   { en: "Announcements",    ta: "அறிவிப்புகள்" },
  reports:         { en: "Reports",          ta: "அறிக்கைகள்" },
  myClasses:       { en: "My Classes",       ta: "என் வகுப்புகள்" },
  attendance:      { en: "Attendance",       ta: "வருகை" },
  marksEntry:      { en: "Marks Entry",      ta: "மதிப்பெண் பதிவு" },
  assignments:     { en: "Assignments",      ta: "பணிகள்" },
  calendar:        { en: "Calendar",         ta: "நாட்காட்டி" },
  homework:        { en: "Homework",         ta: "வீட்டுப்பாடம்" },
  performance:     { en: "Performance",      ta: "செயல்திறன்" },
  reportCard:      { en: "Report Card",      ta: "மதிப்பெண் அட்டை" },
  fees:            { en: "Fees",             ta: "கட்டணம்" },
  messages:        { en: "Messages",         ta: "செய்திகள்" },

  // ── Auth ────────────────────────────────────────────────────────────────────
  signIn:          { en: "Sign In",          ta: "உள்நுழைக" },
  signOut:         { en: "Sign Out",         ta: "வெளியேறு" },
  email:           { en: "Email",            ta: "மின்னஞ்சல்" },
  password:        { en: "Password",         ta: "கடவுச்சொல்" },
  yourSchool:      { en: "Your School",      ta: "உங்கள் பள்ளி" },

  // ── Forms ───────────────────────────────────────────────────────────────────
  name:            { en: "Name",             ta: "பெயர்" },
  phone:           { en: "Phone",            ta: "தொலைபேசி" },
  gender:          { en: "Gender",           ta: "பாலினம்" },
  male:            { en: "Male",             ta: "ஆண்" },
  female:          { en: "Female",           ta: "பெண்" },
  other:           { en: "Other",            ta: "மற்றவர்" },
  address:         { en: "Address",          ta: "முகவரி" },
  dateOfBirth:     { en: "Date of Birth",    ta: "பிறந்த தேதி" },
  admissionDate:   { en: "Admission Date",   ta: "சேர்க்கை தேதி" },
  className:       { en: "Class",            ta: "வகுப்பு" },
  section:         { en: "Section",          ta: "பிரிவு" },
  parentName:      { en: "Parent Name",      ta: "பெற்றோர் பெயர்" },
  parentPhone:     { en: "Parent Phone",     ta: "பெற்றோர் தொலைபேசி" },
  subject:         { en: "Subject",          ta: "பாடம்" },
  designation:     { en: "Designation",      ta: "பதவி" },
  department:      { en: "Department",       ta: "துறை" },
  save:            { en: "Save",             ta: "சேமி" },
  cancel:          { en: "Cancel",           ta: "ரத்து" },
  delete:          { en: "Delete",           ta: "நீக்கு" },
  edit:            { en: "Edit",             ta: "திருத்து" },
  add:             { en: "Add",              ta: "சேர்" },
  search:          { en: "Search",           ta: "தேடு" },
  close:           { en: "Close",            ta: "மூடு" },
  back:            { en: "Back",             ta: "பின்" },
  next:            { en: "Next",             ta: "அடுத்து" },
  submit:          { en: "Submit",           ta: "சமர்ப்பி" },
  loading:         { en: "Loading…",         ta: "ஏற்றுகிறது…" },

  // ── Fee module ──────────────────────────────────────────────────────────────
  feeType:         { en: "Fee Type",         ta: "கட்டண வகை" },
  amount:          { en: "Amount",           ta: "தொகை" },
  paidAmount:      { en: "Paid Amount",      ta: "செலுத்திய தொகை" },
  dueDate:         { en: "Due Date",         ta: "கடைசி தேதி" },
  status:          { en: "Status",           ta: "நிலை" },
  paid:            { en: "Paid",             ta: "செலுத்தப்பட்டது" },
  pending:         { en: "Pending",          ta: "நிலுவை" },
  overdue:         { en: "Overdue",          ta: "தாமதம்" },
  partial:         { en: "Partial",          ta: "பகுதி" },
  collectPayment:  { en: "Collect Payment",  ta: "கட்டணம் பெறு" },
  receiptNumber:   { en: "Receipt No.",      ta: "ரசீது எண்" },

  // ── General ─────────────────────────────────────────────────────────────────
  role:            { en: "Role",             ta: "பங்கு" },
  teacher:         { en: "Teacher",          ta: "ஆசிரியர்" },
  accountant:      { en: "Accountant",       ta: "கணக்காளர்" },
  admin:           { en: "Admin",            ta: "நிர்வாகி" },
  parent:          { en: "Parent",           ta: "பெற்றோர்" },
  student:         { en: "Student",          ta: "மாணவர்" },
  total:           { en: "Total",            ta: "மொத்தம்" },
  academicYear:    { en: "Academic Year",    ta: "கல்வி ஆண்டு" },
  noData:          { en: "No data found",    ta: "தரவு இல்லை" },
  error:           { en: "Error",            ta: "பிழை" },
  success:         { en: "Success",          ta: "வெற்றி" },
  confirm:         { en: "Confirm",          ta: "உறுதிப்படுத்து" },
  remarks:         { en: "Remarks",          ta: "குறிப்புகள்" },
  description:     { en: "Description",      ta: "விளக்கம்" },
  date:            { en: "Date",             ta: "தேதி" },
  active:          { en: "Active",           ta: "செயலில்" },
  inactive:        { en: "Inactive",         ta: "செயலற்றது" },
  welcome:         { en: "Welcome",          ta: "வரவேற்கிறோம்" },
  rolePermissions: { en: "Role Permissions", ta: "பங்கு அனுமதிகள்" },
  feePayment:      { en: "Fee Payment",      ta: "கட்டணம் செலுத்து" },

  // ── Dashboard stat cards ────────────────────────────────────────────────────
  totalStudentsLabel:  { en: "Total Students",        ta: "மொத்த மாணவர்கள்" },
  activeStudentsLabel: { en: "Active Students",        ta: "செயலில் உள்ள மாணவர்கள்" },
  totalStaffLabel:     { en: "Total Staff",            ta: "மொத்த பணியாளர்கள்" },
  totalClassesLabel:   { en: "Total Classes",          ta: "மொத்த வகுப்புகள்" },
  feeCollectedLabel:   { en: "Fee Collected",          ta: "வசூலிக்கப்பட்ட கட்டணம்" },
  todayAttendanceLabel:{ en: "Today's Attendance",     ta: "இன்றைய வருகை" },
  pendingFeesLabel:    { en: "Pending Fees",            ta: "நிலுவை கட்டணம்" },
  totalCollected:      { en: "Total Collected",         ta: "மொத்த வசூல்" },
  totalPending:        { en: "Total Pending",           ta: "மொத்த நிலுவை" },
  overdueAmount:       { en: "Overdue Amount",          ta: "காலாவதியான தொகை" },
  collectionRate:      { en: "Collection Rate",         ta: "வசூல் விகிதம்" },
  departmentsLabel:    { en: "Departments",             ta: "துறைகள்" },

  // ── Chart / section titles ──────────────────────────────────────────────────
  enrollmentTrend:     { en: "Student Enrollment Trend",      ta: "மாணவர் சேர்க்கை போக்கு" },
  attendanceOverview:  { en: "Monthly Attendance Overview",   ta: "மாதாந்திர வருகை கண்ணோட்டம்" },
  feeAnalysis:         { en: "Fee Collection Analysis",       ta: "கட்டண வசூல் பகுப்பாய்வு" },
  classStrengthTitle:  { en: "Class-wise Strength",           ta: "வகுப்பு வாரியான மாணவர் எண்ணிக்கை" },
  gradeDistribution:   { en: "Grade Distribution",            ta: "தர விநியோகம்" },
  recentAdmissions:    { en: "Recent Admissions",             ta: "சமீபத்திய சேர்க்கைகள்" },
  welcomePrincipal:    { en: "Welcome back, Principal! 👋",   ta: "மீண்டும் வரவேற்கிறோம், முதல்வர்! 👋" },

  // ── Action buttons ──────────────────────────────────────────────────────────
  addStudent:          { en: "Add Student",     ta: "மாணவரை சேர்" },
  addStaff:            { en: "Add Staff",        ta: "பணியாளரை சேர்" },
  addFee:              { en: "Add Fee",          ta: "கட்டணம் சேர்" },
  exportBtn:           { en: "Export",           ta: "ஏற்றுமதி" },
  previous:            { en: "Previous",         ta: "முந்தைய" },
  retry:               { en: "Retry",            ta: "மீண்டும் முயற்சி" },
  viewAll:             { en: "View all",         ta: "அனைத்தையும் பார்" },

  // ── Filter dropdowns ────────────────────────────────────────────────────────
  allClasses:          { en: "All Classes",      ta: "அனைத்து வகுப்புகள்" },
  allDepartments:      { en: "All Departments",  ta: "அனைத்து துறைகள்" },
  allStatus:           { en: "All Status",       ta: "அனைத்து நிலைகள்" },
  allFeeTypes:         { en: "All Fee Types",    ta: "அனைத்து கட்டண வகைகள்" },

  // ── Table column headers ────────────────────────────────────────────────────
  actions:             { en: "Actions",          ta: "செயல்கள்" },
  idLabel:             { en: "ID",               ta: "அடையாளம்" },
  balance:             { en: "Balance",          ta: "இருப்பு" },
  parentLoginLabel:    { en: "Parent Login",     ta: "பெற்றோர் உள்நுழைவு" },
  feeStatusLabel:      { en: "Fee Status",       ta: "கட்டண நிலை" },
  staffMemberLabel:    { en: "Staff Member",     ta: "பணியாளர்" },
  experienceLabel:     { en: "Experience",       ta: "அனுபவம்" },
  loginLabel:          { en: "Login",            ta: "உள்நுழைவு" },
  subjectsLabel:       { en: "Subjects",         ta: "பாடங்கள்" },

  // ── Modal sections ──────────────────────────────────────────────────────────
  studentDetails:      { en: "Student Details",      ta: "மாணவர் விவரங்கள்" },
  personalInfo:        { en: "Personal Info",         ta: "தனிப்பட்ட தகவல்" },
  parentInfo:          { en: "Parent Info",           ta: "பெற்றோர் தகவல்" },
  attendanceSummary:   { en: "Attendance Summary",    ta: "வருகை சுருக்கம்" },
  feeRecordsLabel:     { en: "Fee Records",           ta: "கட்டண பதிவுகள்" },

  // ── Attendance breakdown ────────────────────────────────────────────────────
  present:             { en: "Present",          ta: "வருகை" },
  absent:              { en: "Absent",           ta: "வருகையின்மை" },
  totalDays:           { en: "Total Days",       ta: "மொத்த நாட்கள்" },
  percentage:          { en: "Percentage",       ta: "சதவீதம்" },

  // ── Header / Search ─────────────────────────────────────────────────────────
  searchPlaceholder:   { en: "Search students, staff...", ta: "மாணவர்கள், பணியாளர்களை தேடுக..." },

  // ── Auth / Login page ───────────────────────────────────────────────────────
  schoolMgmtSystem:    { en: "School Management System",          ta: "பள்ளி நிர்வாக அமைப்பு" },
  signInPortal:        { en: "Sign in to access your portal",     ta: "உங்கள் போர்டலை அணுக உள்நுழைக" },
  emailAddress:        { en: "Email Address",                     ta: "மின்னஞ்சல் முகவரி" },
  paymentMethodLabel:  { en: "Payment Method",                    ta: "கட்டண முறை" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang] ?? translations[key].en;
}
