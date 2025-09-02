import { Save } from "lucide-react";
import { API_ENDPOINTS, USER_KEY } from "../../utils/constants";
import { useForm } from "react-hook-form";
import handleErrorAlerts from "../../utils/showErrorMessages";
import { useCustomPatch } from "../../hooks/useMutation";
import toast from "react-hot-toast";
import { readUserFromStorage } from "../../services/auth";

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  location: string;
  phone: string;
  bio: string;
  profile_image: File;
}

interface Props {
  setIsEditing: (s: boolean) => void;
}

export default function EditUserProfile({ setIsEditing }: Props) {
  const currentUser: User = readUserFromStorage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      first_name: currentUser?.first_name ?? "",
      last_name: currentUser?.last_name ?? "",
      email: currentUser?.email ?? "",
      location: currentUser?.location ?? "",
      phone: currentUser?.phone ?? "",
      bio: currentUser?.bio ?? "",
    },
  });

  const editUser = useCustomPatch(API_ENDPOINTS.updateProfile, [
    "update-profile",
  ]);

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("location", data.location);
      formData.append("bio", data.bio);

      const res = await editUser.mutateAsync(formData);

      if (res?.status) {
        toast.success("Changes saved successfully!");
        const user = {
          ...currentUser,
          first_name: res?.data?.first_name,
          last_name: res?.data?.last_name,
          email: res?.data?.email,
          profile_image: res?.data?.profile_image,
          location: res?.data?.location,
          phone: res?.data?.phone,
          bio: res?.data?.bio,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setIsEditing(false);
      } else {
        toast.error(
          res.first_name[0] ||
            res.last_name[0] ||
            res.email[0] ||
            res.location[0] ||
            res.bio[0] ||
            res.phone[0] ||
            "There is an error"
        );
      }
    } catch (error: any) {
      const payload = error?.response?.data;
      handleErrorAlerts(
        payload?.message || "There is an unexpected error occured."
      );
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
      hasError ? "border-red-500 focus:border-red-500" : "border-gray-300"
    }`;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            {...register("first_name", { required: "First Name is required" })}
            className={inputClass(!!errors.first_name)}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.first_name.message ?? "First Name is required")}
            </p>
          )}
        </div>
        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fisrt Name
          </label>
          <input
            type="text"
            {...register("first_name", { required: "First name is required" })}
            className={inputClass(!!errors.first_name)}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.first_name.message ?? "First name is required")}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            {...register("last_name", { required: "Last name is required" })}
            className={inputClass(!!errors.last_name)}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.last_name.message ?? "Last name is required")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                message: "Please enter a valid email.",
              },
            })}
            className={inputClass(!!errors.email)}
          />
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            {...register("phone", {
              pattern: {
                value: /^07\d{8}$/,
                message: "Phone must starts with 07 and consists of 10 digits",
              },
              minLength: {
                value: 10,
                message: "Phone must consists of 10 digits",
              },
              maxLength: {
                value: 10,
                message: "Phone must consists of 10 digits",
              },
            })}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ""
              );
            }}
            className={inputClass(!!errors.phone)}
            placeholder="07XXXXXXXX"
          />
          {errors.phone && (
            <span className="text-sm text-red-500 mt-1 block">
              {errors.phone.message as string}
            </span>
          )}
        </div>
        {/* Location */}
        <div className="md:col-span-2 ">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            {...register("location")}
            className={inputClass(!!errors.location)}
          />
        </div>
      </div>
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          rows={4}
          {...register("bio")}
          className={inputClass(!!errors.bio)}
        />
      </div>
      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setIsEditing(false)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
