import { useEffect } from "react";

// The full Lesson Teacher app is a self-contained static bundle in /public/app/.
// We render it inside an iframe so the Lovable preview shows the real app
// and you can test/preview here directly.
const Index = () => {
  useEffect(() => {
    document.title = "Lesson Teacher — Your Personal Tutor";
  }, []);

  return (
    <iframe
      src="/app/index.html"
      title="Lesson Teacher"
      className="fixed inset-0 h-screen w-screen border-0"
    />
  );
};

export default Index;
