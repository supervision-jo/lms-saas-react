import { useMemo, useRef, useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useCustomQuery } from "../../../hooks/useQuery";
import { useCustomPost } from "../../../hooks/useMutation";
import { API_ENDPOINTS } from "../../../utils/constants";
import toast from "react-hot-toast";
import handleErrorAlerts from "../../../utils/showErrorMessages";

type FormValues = {
  title: string;
  description: string;
  sub_category: string;
  level: "beginner" | "intermediate" | "advanced";
  is_published: boolean;
  is_paid: boolean;
  price?: number | null;
  picture: FileList;
};

export default function CourseInformationForm({
  setActiveTab,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { data } = useCustomQuery(API_ENDPOINTS.subCategories, [
    "sub-categories",
  ]);
  const subCategories: SubCategory[] = useMemo(() => data?.data ?? [], [data]);
  const firstSubId = useMemo(
    () => subCategories?.[0]?.id ?? "",
    [subCategories]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    resetField,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      sub_category: firstSubId,
      level: "beginner",
      is_published: true,
      is_paid: false,
      price: null,
    },
  });

  useEffect(() => {
    if (firstSubId) {
      reset((v) => ({ ...v, sub_category: v.sub_category || firstSubId }));
    }
  }, [firstSubId, reset]);

  const isPaid = watch("is_paid");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutateAsync: createCourse, isPending } = useCustomPost(
    API_ENDPOINTS.createCourse,
    []
  );

  const onSubmit = async (values: FormValues) => {
    const fd = new FormData();
    fd.append("title", values.title.trim());
    fd.append("description", values.description.trim());
    fd.append("sub_category", values.sub_category);
    fd.append("level", values.level);
    fd.append("is_published", String(values.is_published));
    fd.append("is_paid", String(values.is_paid));

    if (values.is_paid && values.price != null) {
      fd.append("price", String(values.price));
    }

    const file = values.picture?.[0];
    if (file) fd.append("picture", file);

    const res = await createCourse(fd);

    if (res?.status) {
      toast.success("Course created successfully!");
      setActiveTab("curriculum");

      reset({
        title: "",
        description: "",
        sub_category: firstSubId,
        level: "beginner",
        is_published: true,
        is_paid: false,
        price: null,
      });
      resetField("picture");
      setPreviewUrl(null);
    } else {
      const err = res?.error;
      handleErrorAlerts(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-sm p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Course Information
      </h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            placeholder="Enter course title"
            {...register("title", { required: "Title is required" })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.title ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description *
          </label>
          <textarea
            rows={5}
            placeholder="Describe what students will learn in this course"
            {...register("description", {
              required: "Description is required",
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
              errors.description ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category / Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($) {isPaid ? "*" : "(disabled for free courses)"}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={isPaid ? "e.g. 29.99" : "0.00"}
              disabled={!isPaid}
              {...register("price", {
                validate: (v, fv) =>
                  fv.is_paid
                    ? (v != null && Number(v) > 0) ||
                      "Price is required and must be greater than 0"
                    : true,
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
                errors.price ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {String(errors.price.message)}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register("sub_category", {
                required: "Category is required",
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.sub_category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.sub_category.message}
              </p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <select
              {...register("level", { required: "Level is required" })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Pricing (matches design of Publishing) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
          <div className="flex sm:items-center sm:flex-row sm:justify-between flex-col items-start justify-start gap-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Course Pricing</h4>
              <p className="text-sm text-gray-600">
                Choose whether your course is free or paid
              </p>
            </div>

            <Controller
              control={control}
              name="is_paid"
              render={({ field }) => (
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 sm:w-40 w-full"
                  value={field.value ? "paid" : "free"}
                  onChange={(e) => {
                    const paid = e.target.value === "paid";
                    field.onChange(paid);
                    if (!paid) {
                      // Clear price when switching to Free and re-validate
                      setValue("price", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Publishing (status) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Publishing
          </h3>
          <div className="flex sm:items-center sm:flex-row sm:justify-between flex-col items-start justify-start gap-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Course Status</h4>
              <p className="text-sm text-gray-600">
                Control who can see your course
              </p>
            </div>

            <Controller
              control={control}
              name="is_published"
              render={({ field }) => (
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40"
                  value={field.value ? "published" : "draft"}
                  onChange={(e) =>
                    field.onChange(e.target.value === "published")
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Thumbnail uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Thumbnail
          </label>

          <Controller
            control={control}
            name="picture"
            rules={{
              validate: (fl) => {
                const f = fl?.[0];
                if (!f) return true; // optional
                const ok = ["image/png", "image/jpeg", "image/webp"].includes(
                  f.type
                );
                if (!ok) return "Only PNG, JPG, or WEBP allowed";
                if (f.size > 2 * 1024 * 1024) return "Max size is 2MB";
                return true;
              },
            }}
            render={({ field: { onChange } }) => (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto h-28 object-contain rounded"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const files = e.target.files as FileList;
                    onChange(files);
                    const f = files?.[0];
                    if (f) {
                      const url = URL.createObjectURL(f);
                      setPreviewUrl(url);
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                />
              </>
            )}
          />
          {errors.picture && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.picture.message)}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-60"
          >
            {isSubmitting || isPending ? "Creating…" : "Create Course"}
          </button>
        </div>
      </div>
    </form>
  );
}
