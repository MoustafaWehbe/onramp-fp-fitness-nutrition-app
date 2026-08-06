"use strict";

const { COACHES } = require("./20260806120100-seed-coaches");

const byEmail = Object.fromEntries(COACHES.map((c) => [c.email, c.id]));

const PROFILES = [
  {
    email: "coach.sara@fitcoach.ai",
    title: "Certified Strength & Conditioning Coach",
    bio: "I help clients build sustainable strength and lose fat without extreme diets. 8 years coaching everyone from beginners to competitive lifters.",
    gender: "female",
    birthDate: "1991-04-12",
    specialties: ["Weight loss", "Strength training", "Nutrition"],
    yearsExperience: 8,
    certifications: ["NASM-CPT", "Precision Nutrition L1"],
    rating: 4.9,
    clientsCount: 142,
  },
  {
    email: "coach.omar@fitcoach.ai",
    title: "Hypertrophy & Performance Coach",
    bio: "Former competitive powerlifter turned coach. I specialize in building muscle through progressive overload and smart programming.",
    gender: "male",
    birthDate: "1988-11-03",
    specialties: ["Muscle gain", "Powerlifting", "Progressive overload"],
    yearsExperience: 6,
    certifications: ["ISSA-CPT"],
    rating: 4.8,
    clientsCount: 98,
  },
  {
    email: "coach.lina@fitcoach.ai",
    title: "Wellness & Body Recomposition Coach",
    bio: "I focus on balanced, long-term results — building lean muscle while staying at a healthy maintenance weight. Big on habit-building over quick fixes.",
    gender: "female",
    birthDate: "1994-07-21",
    specialties: ["Recomposition", "Habit coaching", "Mobility"],
    yearsExperience: 5,
    certifications: ["ACE-CPT", "Yoga Alliance RYT-200"],
    rating: 4.7,
    clientsCount: 76,
  },
];

/** Derived from the coach id so the rollback can target these rows exactly. */
function profileId(userId) {
  return userId.replace(/c(\d)$/, "d$1");
}

module.exports = {
  /** @type {import('sequelize-cli').Migration} */
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "coach_profiles",
      PROFILES.map((p) => ({
        id: profileId(byEmail[p.email]),
        user_id: byEmail[p.email],
        title: p.title,
        bio: p.bio,
        gender: p.gender,
        birth_date: p.birthDate,
        specialties: JSON.stringify(p.specialties),
        years_experience: p.yearsExperience,
        certifications: JSON.stringify(p.certifications),
        rating: p.rating,
        clients_count: p.clientsCount,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      })),
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    // Scoped to the seeded rows. A bare bulkDelete would take real coaches'
    // profiles with it.
    await queryInterface.bulkDelete("coach_profiles", {
      user_id: Object.values(byEmail),
    });
  },
};
