import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useCoachProfile } from "../../hooks/useCoachProfile";
import { apiErrorMessage } from "../../lib/api-error";
import type { Gender } from "../../lib/api-types";

const field = "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm";

/** Stored as arrays; edited as one comma-separated line. */
const toList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export const CoachProfileCard = () => {
  const { profile, isLoading, error, saveProfile } = useCoachProfile();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [certifications, setCertifications] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setTitle(profile.title ?? "");
    setBio(profile.bio ?? "");
    setGender(profile.gender ?? "");
    setBirthDate(profile.birthDate ?? "");
    setYearsExperience(
      profile.yearsExperience === null ? "" : String(profile.yearsExperience),
    );
    setSpecialties((profile.specialties ?? []).join(", "));
    setCertifications((profile.certifications ?? []).join(", "));
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    setMessage(null);
    try {
      await saveProfile({
        title: title || null,
        bio: bio || null,
        gender: gender || null,
        birthDate: birthDate || null,
        yearsExperience: yearsExperience === "" ? null : Number(yearsExperience),
        specialties: toList(specialties),
        certifications: toList(certifications),
        avatarUrl: avatarUrl || null,
      });
      setMessage("Profile saved.");
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not save your profile"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  // Never offer the form on a failed load: the fields would be empty, and
  // saving would write those blanks over a profile that does exist.
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coach profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach profile</CardTitle>
        <CardDescription>
          This is what clients see when browsing for a coach.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Headline</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Certified Strength & Conditioning Coach"
              className={field}
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={field}
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-slate-700">Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | "")}
              className={field}
            >
              <option value="">Not set</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-slate-700">
              Date of birth <span className="text-slate-400">(shown as age)</span>
            </span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={field}
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-slate-700">Years of experience</span>
            <input
              type="number"
              min={0}
              max={80}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className={field}
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-slate-700">Photo URL</span>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className={field}
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">
              Specialties <span className="text-slate-400">(comma separated)</span>
            </span>
            <input
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="Weight loss, Strength training"
              className={field}
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">
              Certifications <span className="text-slate-400">(comma separated)</span>
            </span>
            <input
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="NASM-CPT, Precision Nutrition L1"
              className={field}
            />
          </label>

          {formError && (
            <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-700 sm:col-span-2">{message}</p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>

        {profile && (
          <p className="mt-4 text-xs text-slate-500">
            Rating {profile.rating ?? "—"} · {profile.clientsCount} clients. Both
            are set by the platform, not editable here.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
