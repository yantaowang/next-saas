"use client";

interface DocumentationButtonProps {
  isSubscribed: boolean;
  user: { id: string; email?: string } | null;
}

export function DocumentationButton({
  isSubscribed,
  user,
}: DocumentationButtonProps) {

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 阻止默认行为
    e.preventDefault();
    e.stopPropagation();

    // 如果用户已订阅，允许跳转到文档页面
    if (isSubscribed && user) {
      window.open(
        "https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    // 如果用户未登录，先跳转到登录页面
    if (!user) {
      window.location.href = "/auth/login?next=" + encodeURIComponent("/subscribe?plan=pro");
      return;
    }

    // 如果用户已登录但未订阅，直接跳转到支付页面
    window.location.href = "/subscribe?plan=pro";
  };

  return (
    <a
      className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px] cursor-pointer"
      href={
        isSubscribed && user
          ? "https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          : "#"
      }
      onClick={handleClick}
      target={isSubscribed && user ? "_blank" : undefined}
      rel={isSubscribed && user ? "noopener noreferrer" : undefined}
    >
      Documentation
    </a>
  );
}

