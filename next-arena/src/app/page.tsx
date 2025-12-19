import { EditorProvider } from "@/context/EditorContext";
import Workbench from "@/components/Layout/Workbench";

export default function Home() {
  return (
    <EditorProvider>
      <Workbench />
    </EditorProvider>
  );
}
