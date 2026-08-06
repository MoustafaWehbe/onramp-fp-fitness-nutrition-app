"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    const coaches = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE role = 'coach';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const byEmail = Object.fromEntries(coaches.map((c) => [c.email, c.id]));
    const now = new Date();

    const PROFILES = [
      {
        email: "coach.sara@fitcoach.ai",
        title: "Certified Strength & Conditioning Coach",
        bio: "I help clients build sustainable strength and lose fat without extreme diets. 8 years coaching everyone from beginners to competitive lifters.",
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
        specialties: ["Recomposition", "Habit coaching", "Mobility"],
        yearsExperience: 5,
        certifications: ["ACE-CPT", "Yoga Alliance RYT-200"],
        rating: 4.7,
        clientsCount: 76,
      },
    ];

    const rows = PROFILES.filter((p) => byEmail[p.email]).map((p) => ({
      id: uuidv4(),
      user_id: byEmail[p.email],
      title: p.title,
      bio: p.bio,
      specialties: JSON.stringify(p.specialties),
      years_experience: p.yearsExperience,
      certifications: JSON.stringify(p.certifications),
      rating: p.rating,
      clients_count: p.clientsCount,
      avatar_url: null,
      created_at: now,
      updated_at: now,
    }));

    if (rows.length > 0) {
      await queryInterface.bulkInsert("coach_profiles", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("coach_profiles", null, {});
  },
};