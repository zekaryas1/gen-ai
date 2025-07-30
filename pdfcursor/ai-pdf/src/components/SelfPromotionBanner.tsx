import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SelfPromotionBannerPropType {
  name: string;
  link: string;
}

export default function SelfPromotionBanner(
  props: SelfPromotionBannerPropType,
) {
  const { name, link } = props;
  return (
    <footer
      className={
        "flex flex-col justify-center items-center border-t-1 pt-2 border-gray-200"
      }
    >
      <p>Made by {name}</p>
      <Button variant={"link"} asChild>
        <Link href={link}>@Github</Link>
      </Button>
    </footer>
  );
}
