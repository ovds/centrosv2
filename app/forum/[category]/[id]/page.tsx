import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDiscussion, incrementViewCount } from "@/lib/api";
import { Discussion } from "@/types";
import Layout from "@/components/Layout";
import DiscussionDetail from "@/components/DiscussionDetail";

const DiscussionPage = () => {
  const router = useRouter();
  const { category, id } = router.query;
  const [discussion, setDiscussion] = useState<Discussion | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDiscussion = async () => {
        const data = await getDiscussion(id as string);
        setDiscussion(data);
      };

      fetchDiscussion();
    }
  }, [id]);

  // Add error handling for view count increment
  useEffect(() => {
    if (discussion) {
      // Wrap the increment view count operation in try/catch
      const updateViewCount = async () => {
        try {
          await incrementViewCount(discussion.discussion_id);
          console.log("View count incremented successfully");
        } catch (error) {
          console.error("Failed to increment view count:", error);
          // Continue with page rendering even if view increment fails
        }
      };
      
      updateViewCount();
    }
  }, [discussion]);

  if (!discussion) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <DiscussionDetail discussion={discussion} />
    </Layout>
  );
};

export default DiscussionPage;