import * as yup from 'yup';
import {
  DEPARTMENTS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  MAX_RESUME_MB,
  NOTICE_PERIODS,
  ROLES,
  ROUND_MODES,
  ROUND_TYPES,
  WORK_MODES,
} from '../utils/constants';

// Empty inputs from <input type="number"> arrive as "" — treat them as undefined.
const optionalNumber = () =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || orig === null ? undefined : v))
    .typeError('Must be a number');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const loginSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup.string().trim().required('Full name is required').min(2, 'Name is too short').max(60),
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
  role: yup.string().oneOf(Object.values(ROLES), 'Choose a role').required('Choose a role'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/[A-Za-z]/, 'Include at least one letter')
    .matches(/\d/, 'Include at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export const applicationSchema = yup.object({
  fullName: yup.string().trim().required('Full name is required').min(2, 'Name is too short'),
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  linkedin: yup
    .string()
    .trim()
    .url('Enter a valid URL (https://...)')
    .matches(/linkedin\.com/i, { message: 'Must be a LinkedIn URL', excludeEmptyString: true })
    .optional(),
  experienceYears: optionalNumber()
    .required('Experience is required')
    .min(0, 'Cannot be negative')
    .max(50, 'That seems too high'),
  currentCompany: yup.string().trim().max(80).optional(),
  expectedCtc: optionalNumber().min(0, 'Cannot be negative').max(500, 'Enter CTC in LPA').optional(),
  noticePeriod: yup.string().oneOf(NOTICE_PERIODS, 'Select notice period').required('Select notice period'),
  coverLetter: yup
    .string()
    .trim()
    .required('Tell us why you are a good fit')
    .min(50, 'Please write at least 50 characters')
    .max(1500, 'Keep it under 1500 characters'),
  resume: yup
    .mixed()
    .test('required', 'Please upload your resume', (files) => files && files.length > 0)
    .test('type', 'Resume must be a PDF file', (files) => !files?.[0] || files[0].type === 'application/pdf')
    .test(
      'size',
      `File must be smaller than ${MAX_RESUME_MB} MB`,
      (files) => !files?.[0] || files[0].size <= MAX_RESUME_MB * 1024 * 1024,
    ),
  consent: yup.boolean().oneOf([true], 'You must confirm the information is accurate'),
});

export const jobSchema = yup.object({
  title: yup.string().trim().required('Job title is required').min(3).max(80),
  department: yup.string().oneOf(DEPARTMENTS, 'Select a department').required('Select a department'),
  location: yup.string().trim().required('Location is required'),
  workMode: yup.string().oneOf(WORK_MODES).required('Select a work mode'),
  type: yup.string().oneOf(JOB_TYPES).required('Select a job type'),
  experience: yup.string().oneOf(EXPERIENCE_LEVELS).required('Select experience level'),
  salaryMin: optionalNumber().min(0, 'Cannot be negative').optional(),
  salaryMax: optionalNumber()
    .min(0, 'Cannot be negative')
    .optional()
    .when('salaryMin', ([min], s) =>
      min != null ? s.min(min, 'Max salary must be greater than or equal to min salary') : s,
    ),
  openings: optionalNumber().required('Number of openings is required').integer('Whole number only').min(1).max(100),
  deadline: yup
    .date()
    .transform((v, orig) => (orig === '' ? undefined : v))
    .typeError('Enter a valid date')
    .required('Application deadline is required')
    // Closed jobs may keep a past deadline; open ones must accept applications.
    .test('not-past', 'Deadline cannot be in the past', function (v) {
      return !v || this.parent.status === 'Closed' || v >= startOfToday();
    }),
  skills: yup
    .string()
    .trim()
    .required('Add at least one skill')
    .test('max', 'Up to 10 skills', (v) => !v || v.split(',').filter((s) => s.trim()).length <= 10),
  description: yup.string().trim().required('Description is required').min(30, 'At least 30 characters'),
  requirements: yup.string().trim().required('Add at least one requirement'),
  status: yup.string().oneOf(['Open', 'Closed']).required(),
});

export const roundSchema = yup.object({
  name: yup.string().trim().required('Round name is required').max(60),
  type: yup.string().oneOf(ROUND_TYPES).required('Select a round type'),
  interviewer: yup.string().trim().required('Interviewer is required'),
  scheduledAt: yup
    .date()
    .transform((v, orig) => (orig === '' ? undefined : v))
    .typeError('Pick a date and time')
    .required('Pick a date and time')
    .test('future', 'Interview must be scheduled in the future', (v) => !v || v.getTime() > Date.now()),
  mode: yup.string().oneOf(ROUND_MODES).required('Select a mode'),
  meetingLink: yup
    .string()
    .trim()
    .url('Enter a valid URL')
    .optional()
    .when('mode', ([mode], s) => (mode === 'Video Call' ? s.required('Meeting link is required for video calls') : s)),
});
