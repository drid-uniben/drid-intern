export interface SubmissionRequirements {
  heading: string;
  points: string[];
  requiresDesignAssets: boolean;
}

const isDesignCategory = (category: string): boolean => category.toLowerCase().includes("design");

export const getSubmissionRequirements = (category: string): SubmissionRequirements => {
  if (isDesignCategory(category)) {
    return {
      heading: "Design submission requirements",
      points: [
        "A public Figma file URL is required.",
        "Add a short rationale in the message field.",
        "Ensure the Figma file is accessible for reviewers.",
      ],
      requiresDesignAssets: true,
    };
  }

  return {
    heading: "Engineering submission requirements",
    points: [
      "A public GitHub repository URL is required.",
      "A live deployment URL is required.",
      "Include key implementation notes in the message field.",
    ],
    requiresDesignAssets: false,
  };
};
