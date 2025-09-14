import { Upload } from "lucide-react";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

type CourseFormInputs = {
  title: string;
  description: string;
  price: number;
  level: string; // "beginner" | "intermediate" | "advanced" | "all-levels"
  sub_category: string; // uuid from API
};

type CourseLocal = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string; // sub_category id
  level: string;
  modules: BuilderModule[]; // lessons array items may be BuilderLessonEx at runtime
};

interface Props {
  register: UseFormRegister<CourseFormInputs>;
  setThumbnailFile: React.Dispatch<React.SetStateAction<File | null>>;
  setValue: UseFormSetValue<CourseFormInputs>;
  watch: UseFormWatch<CourseFormInputs>;
  subCategories: SubCategory[];
  syncCourseField: (field: keyof CourseLocal, value: any) => void;
  thumbnailFile: File | null;
}

export default function CourseInformationForm({
  register,
  setThumbnailFile,
  setValue,
  subCategories,
  syncCourseField,
  thumbnailFile,
  watch,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Course Information
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            {...register("title")}
            onChange={(e) => {
              setValue("title", e.target.value);
              syncCourseField("title", e.target.value);
            }}
            value={watch("title") || ""}
            placeholder="Enter course title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description *
          </label>
          <textarea
            {...register("description")}
            onChange={(e) => {
              setValue("description", e.target.value);
              syncCourseField("description", e.target.value);
            }}
            value={watch("description") || ""}
            placeholder="Describe what students will learn in this course"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const safe = Number.isFinite(val) ? val : 0;
                setValue("price", safe as any);
                syncCourseField("price", safe);
              }}
              value={
                Number.isFinite(watch("price") as any)
                  ? (watch("price") as any)
                  : 0
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register("sub_category")}
              onChange={(e) => {
                setValue("sub_category", e.target.value);
                syncCourseField("category", e.target.value);
              }}
              value={watch("sub_category") || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {subCategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <select
              {...register("level")}
              onChange={(e) => {
                setValue("level", e.target.value);
                syncCourseField("level", e.target.value);
              }}
              value={watch("level") || "beginner"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Thumbnail
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => {
              const inp = document.getElementById(
                "course-thumb"
              ) as HTMLInputElement | null;
              inp?.click();
            }}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
            <input
              id="course-thumb"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
            {thumbnailFile && (
              <p className="text-sm text-gray-500 mt-2 truncate">
                Selected: {thumbnailFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
