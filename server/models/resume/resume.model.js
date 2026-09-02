import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    resumeText: {
      type: String,
      required: true,
    },

    analysis: {
      candidate: {
        name: {
          type: String,
          default: "",
        },

        email: {
          type: String,
          default: "",
        },

        phone: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },
      },

      professionalSummary: {
        type: String,
        default: "",
      },

      experienceLevel: {
        type: String,
        default: "",
      },

      skills: {
        programmingLanguages: {
          type: [String],
          default: [],
        },

        frontend: {
          type: [String],
          default: [],
        },

        backend: {
          type: [String],
          default: [],
        },

        databases: {
          type: [String],
          default: [],
        },

        tools: {
          type: [String],
          default: [],
        },

        coreConcepts: {
          type: [String],
          default: [],
        },
      },

      projects: {
        type: [
          {
            name: String,
            technologies: [String],
            description: String,
          },
        ],
        default: [],
      },

      education: {
        type: [
          {
            degree: String,
            institution: String,
            year: String,
            score: String,
          },
        ],
        default: [],
      },

      certifications: {
        type: [String],
        default: [],
      },

      suggestedRoles: {
        type: [String],
        default: [],
      },

      interviewFocusAreas: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;