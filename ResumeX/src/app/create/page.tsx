'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ResumeTemplate } from '@/lib/templates';
import { TemplateGallery } from '@/components/TemplateGallery';
import { UseTemplateButton } from '@/components/UseTemplateButton';
import { prepareResume, saveTips } from '@/lib/rexWriter';
import {
  BuildOptions,
  InterviewState,
  ResumeInterview,
  clearInterview,
  emptyFormData,
  loadSessionInterview,
  saveSessionInterview,
} from '@/components/ResumeInterview';

// Free plan resume limit (enforced by the backend too)
const FREE_RESUME_LIMIT = 2;

const inputClass =
  'px-4 py-3 rounded-lg bg-black border border-white/15 focus:border-[#8c45ff] focus:outline-none';
const primaryButtonClass =
  'rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition disabled:opacity-50';

export default function CreateResumePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [template, setTemplate] = useState<ResumeTemplate | null>(null);
  const [mode, setMode] = useState<'chat' | 'form'>('chat');
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [atResumeLimit, setAtResumeLimit] = useState(false);
  const [ready, setReady] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildingLabel, setBuildingLabel] = useState('Saving...');
  const [buildError, setBuildError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Load what the page needs: AI availability, plan limit, and a template preselected via ?template=
  useEffect(() => {
    if (!user) return;

    const templateId = new URLSearchParams(window.location.search).get('template');
    Promise.all([
      api.getAIStatus().catch(() => false),
      api.getResumes().catch(() => []),
      templateId ? api.getTemplates(true).catch(() => []) : Promise.resolve([]),
    ]).then(([available, resumes, templates]) => {
      setAiAvailable(available);
      setAtResumeLimit(user.plan === 'free' && resumes.length >= FREE_RESUME_LIMIT);
      const preselected = templates.find((t) => t.id === templateId);
      if (preselected && !(preselected.is_pro_only && user.plan !== 'pro')) {
        setTemplate(preselected);
      }
      setReady(true);
    });
  }, [user]);

  const selectTemplate = (selected: ResumeTemplate | null) => {
    setTemplate(selected);
    setBuildError('');
    window.history.replaceState(null, '', selected ? `/create?template=${selected.id}` : '/create');
  };

  // The chat is saved with the resume so it can be reopened from the editor
  // Rex Writer polishes the answers; the raw answers stay in the saved chat for later updates
  const buildFromChat = async (state: InterviewState, options: BuildOptions) => {
    if (!template) return;
    setBuilding(true);
    setBuildingLabel(options.polish ? 'Rex Writer is polishing...' : 'Saving...');
    const prepared = await prepareResume(template.id, state, options.polish);
    await build(prepared.formData, state.title, prepared.tips, {
      messages: state.messages,
      form_data: state.formData,
      done: state.done,
      job_description: state.jobDescription || '',
    });
  };

  const build = async (formData: any, title: string, tips: string[] = [], interview?: any) => {
    if (!template) return;
    setBuilding(true);
    setBuildingLabel('Saving...');
    setBuildError('');
    try {
      const resume = await api.createResume({ title, template_id: template.id, form_data: formData, interview });
      clearInterview(template.id);
      saveTips(resume.id, tips);
      router.push(`/editor/${resume.id}`);
    } catch (error: any) {
      setBuildError(error.message || 'Failed to create resume');
      setBuilding(false);
    }
  };

  if (authLoading || !user || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const useChat = mode === 'chat' && aiAvailable;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col">
      <header className="border-b border-white/15 bg-black/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-2xl font-bold truncate">
              {template ? template.name : 'New Resume'}
            </h1>
            {template && (
              <button
                onClick={() => selectTemplate(null)}
                className="text-sm text-white/70 hover:text-white whitespace-nowrap"
              >
                Change template
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {template && aiAvailable && (
              <button
                onClick={() => setMode(mode === 'chat' ? 'form' : 'chat')}
                className="text-sm text-white/70 hover:text-white whitespace-nowrap"
              >
                {mode === 'chat' ? 'Fill a form instead' : 'Chat with Rex'}
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-white/70 hover:text-white whitespace-nowrap"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 container mx-auto px-4 py-8 flex flex-col">
        {buildError && (
          <div className="mb-5 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
            {buildError}
          </div>
        )}

        {atResumeLimit ? (
          <div className="max-w-xl mx-auto text-center border border-white/15 rounded-xl p-10 backdrop-blur bg-white/5">
            <h2 className="text-2xl font-semibold">You&apos;ve used your free resumes</h2>
            <p className="text-white/70 mt-3">
              The free plan includes {FREE_RESUME_LIMIT} resumes. Delete one to start a new one, or
              upgrade to Pro for unlimited resumes.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Link href="/dashboard" className={`px-5 py-2.5 ${primaryButtonClass}`}>
                Go to dashboard
              </Link>
              <Link href="/pricing" className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition">
                See Pro
              </Link>
            </div>
          </div>
        ) : !template ? (
          <div>
            <h2 className="text-4xl font-medium tracking-tighter">Pick a template</h2>
            <p className="text-white/70 mt-2 mb-8">
              {aiAvailable
                ? 'Preview any template, then Rex, your AI resume buddy, will chat with you to fill it in.'
                : 'Preview any template, then fill in your details.'}
            </p>
            <TemplateGallery
              action={(t) => <UseTemplateButton template={t} onUse={selectTemplate} />}
            />
          </div>
        ) : useChat ? (
          <div className="flex-1 min-h-0">
            <ResumeInterview
              key={template.id}
              template={template}
              initialState={
                loadSessionInterview(template.id) || {
                  messages: [],
                  formData: emptyFormData(user.email),
                  done: false,
                  title: `My ${template.name} Resume`,
                }
              }
              onStateChange={(state) => saveSessionInterview(template.id, state)}
              building={building}
              buildingLabel={buildingLabel}
              buildLabel="Build my resume"
              onBuild={buildFromChat}
            />
          </div>
        ) : (
          <ManualResumeForm
            userEmail={user.email}
            aiUnavailable={!aiAvailable}
            building={building}
            onBuild={(formData, title) => build(formData, title)}
          />
        )}
      </main>
    </div>
  );
}

// Fallback when the AI interviewer is off or the user prefers typing: contact details only,
// everything else is added in the LaTeX editor
const ManualResumeForm = (props: {
  userEmail: string;
  aiUnavailable: boolean;
  building: boolean;
  onBuild: (formData: any, title: string) => void;
}) => {
  const [title, setTitle] = useState('My Resume');
  const [personal, setPersonal] = useState({
    name: '',
    email: props.userEmail,
    phone: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onBuild(
      { personal, education: [], experience: [], skills: [], projects: [] },
      title.trim() || 'My Resume'
    );
  };

  const field = (key: keyof typeof personal, placeholder: string, type = 'text', required = false) => (
    <input
      type={type}
      placeholder={placeholder}
      value={personal[key]}
      onChange={(e) => setPersonal({ ...personal, [key]: e.target.value })}
      className={inputClass}
      required={required}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl w-full mx-auto">
      {props.aiUnavailable && (
        <div className="border border-white/15 rounded-lg p-3 text-sm text-white/70 bg-white/5">
          Rex, the AI interviewer, isn&apos;t available right now, so fill in your details below.
        </div>
      )}

      <div className="border border-white/15 rounded-xl p-6 backdrop-blur bg-white/5">
        <h2 className="text-xl font-semibold mb-4">Resume Details</h2>
        <label className="block text-sm font-medium mb-2">Resume Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full ${inputClass}`}
          required
        />
      </div>

      <div className="border border-white/15 rounded-xl p-6 backdrop-blur bg-white/5">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field('name', 'Full Name', 'text', true)}
          {field('email', 'Email', 'email', true)}
          {field('phone', 'Phone', 'tel')}
          {field('location', 'Location')}
        </div>
      </div>

      <button type="submit" disabled={props.building} className={`w-full py-4 px-6 text-lg ${primaryButtonClass}`}>
        {props.building ? 'Creating...' : 'Create Resume & Continue'}
      </button>

      <p className="text-center text-sm text-white/50">
        You can add education, experience, and other details in the editor
      </p>
    </form>
  );
};
