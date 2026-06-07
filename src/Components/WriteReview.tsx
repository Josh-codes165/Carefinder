import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReview } from "../lib/hospitals";
import { useAuth } from "../Context/AuthContext";
import StarRating from "./StarRating";

type WriteReviewProps = {
  hospitalId: string;
  onClose: () => void;
};

function WriteReview({ hospitalId, onClose }: WriteReviewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      submitReview({
        hospitalId,
        rating,
        reviewText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", hospitalId] });
      setSubmitted(true);
    },
    onError: (error) => {
      console.log("Mutation error:", error);
    },
  });

  if (!user) {
    return (
      <div className="bg-[#f1efe8] rounded-xl p-6 text-center">
        <p className="text-sm text-[#5f5e5a] mb-4">
          You need to be signed in to write a review.
        </p>
        <a
          href="/login"
          className="bg-[#0f6e56] text-sm text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#085041] transition-colors inline-block"
        >
          Sign in a review
        </a>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">✅</div>
        <p className="text-sm font-medium text-[#0F6E56] mb-1">
          Review submitted successfully
        </p>
        <p className="text-xs text-[#5F5E5A]">
          Your review is pending approval and will appear once an admin reviews
          it.
        </p>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-[#0F6E56] underline"
        >
          Close
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <h3 className="text-sm font-medium text-[#1A1A18] mb-4">
        Write a review
      </h3>

      <div className="mb-4">
        <p className="text-xs text-[#888780] uppercase tracking-wide font-medium mb-2">
          Your rating
        </p>
        <StarRating
          rating={rating}
          onChange={(newRating) => {
            mutation.reset();
            setRating(newRating);
          }}
          size="lg"
        />
        {rating > 0 && (
          <p className="text-xs text-[#5F5E5A] mt-1">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs text-[#888780] uppercase tracking-wide font-medium mb-2">
          Your review (optional)
        </p>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience at this hospital..."
          rows={4}
          className="w-full bg-[#F1EFE8] rounded-lg px-4 py-3 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5] resize-none"
        />
      </div>

      {mutation.isError && (
        <div className="bg-[#FCEBEB] border border-red-200 rounded-lg px-4 py-3 text-sm text-[#A32D2D] mb-4">
          Something went wrong. Please try again.
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-[#1A1A18] text-sm font-medium py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            mutation.reset();
            mutation.mutate();
          }}
          disabled={rating === 0 || mutation.isPending}
          className="flex-1 bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
        >
          {mutation.isPending ? "Submitting..." : "Submit review"}
        </button>
      </div>
    </div>
  );
}

export default WriteReview;
