'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ResumeTemplate } from '@/lib/templates';
import { BuildOptions, InterviewState, ResumeInterview } from '@/components/ResumeInterview';
import { prepareResume, saveTips } from '@/lib/rexWriter';

const SAVE_DELAY_MS = 800;

const toInterview = (state: InterviewState) => ({
  messages: state.messages,
  form_data: state.formData,
  done: state.done,
  job_description: state.jobDescription || '',
});

// Reopen the Rex conversation behind a resume to add to or change it
export default function ResumeChatPage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params?.id as string;
  const { user, loading: authLoading } = useAuth();

  const [resume, setResume] = useState<any>(null);
  const [template, setTemplate] = useState<ResumeTemplate | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [updating, setUpdating] = useState(false);
  const [updatingLabel, setUpdatingLabel] = useState('Saving...');
  const [updateError, setUpdateError] = useState('');
  const pendingSave = useRef<InterviewState | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !resumeId) return;
    Promise.all([api.getResume(resumeId), api.getTemplates(true), api.getAIStatus().catch(() => false)])
      .then(([loadedResume, templates, available]) => {
        setResume(loadedResume);
        setTemplate(templates.find((t) => t.id === loadedResume.template_id) || null);
        setAiAvailable(available);
      })
      .catch(() => setLoadError('Could not load this resume.'));
  }, [user, resumeId]);

  const flushSave = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const state = pendingSave.current;
    if (!state) return;
    pendingSave.current = null;
    setSaveStatus('saving');
    try {
      await api.updateResume(resumeId, { interview: toInterview(state) });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  // Save the conversation shortly after each change, and on the way out
  const handleStateChange = (state: InterviewState) => {
    if (state.messages.length === 0) return;
    pendingSave.current = state;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, SAVE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      flushSave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (state: InterviewState, options: BuildOptions) => {
    if (
      resume.has_manual_edits &&
      !confirm(
        "You've edited this resume's LaTeX by hand. Updating from the chat rebuilds it from your answers and replaces those edits. Continue?"
      )
    ) {
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    pendingSave.current = null;
    setUpdating(true);
    setUpdateError('');
    setUpdatingLabel(options.polish ? 'Rex Writer is polishing...' : 'Saving...');
    try {
      // The resume gets the polished content; the chat keeps the raw answers for the next update
      const prepared = await prepareResume(template!.id, state, options.polish);
      setUpdatingLabel('Saving...');
      await api.updateResume(resumeId, {
        title: state.title,
        form_data: prepared.formData,
        interview: toInterview(state),
      });
      saveTips(resumeId, prepared.tips);
      router.push(`/editor/${resumeId}`);
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update resume');
      setUpdating(false);
    }
  };

  if (authLoading || !user || (!resume && !loadError)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const unavailableReason = loadError
    ? loadError
    : !template
      ? "This resume's template no longer exists, so Rex can't continue the chat. You can still edit it in the editor."
      : !aiAvailable
        ? "Rex isn't available right now. You can still edit your resume in the editor."
        : '';

  return (
    <div className="min-h-screen lg:h-screen flex flex-col">
      <header className="border-b border-white/15 bg-black/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push(`/editor/${resumeId}`)}
              className="text-sm text-white/70 hover:text-white whitespace-nowrap"
            >
              ← Back to editor
            </button>
            <h1 className="text-xl font-bold truncate">{resume?.title}</h1>
          </div>
          {!unavailableReason && (
            <span className="text-xs text-white/50 whitespace-nowrap">
              {saveStatus === 'saving'
                ? 'Saving chat...'
                : saveStatus === 'error'
                  ? 'Chat not saved'
                  : 'Chat saved'}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 container mx-auto px-4 py-8 flex flex-col">
        {updateError && (
          <div className="mb-5 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
            {updateError}
          </div>
        )}

        {unavailableReason ? (
          <div className="max-w-xl mx-auto text-center border border-white/15 rounded-xl p-10 backdrop-blur bg-white/5">
            <p className="text-white/70">{unavailableReason}</p>
            <button
              onClick={() => router.push(`/editor/${resumeId}`)}
              className="mt-6 px-5 py-2.5 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition"
            >
              Open editor
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResumeInterview
              template={template!}
              initialState={
                resume.interview
                  ? {
                      messages: resume.interview.messages,
                      formData: resume.interview.form_data,
                      done: resume.interview.done,
                      title: resume.title,
                      jobDescription: resume.interview.job_description || '',
                    }
                  : { messages: [], formData: resume.form_data, done: false, title: resume.title }
              }
              onStateChange={handleStateChange}
              building={updating}
              buildingLabel={updatingLabel}
              buildLabel="Update my resume"
              onBuild={handleUpdate}
            />
          </div>
        )}
      </main>
    </div>
  );
}
