import issues from "./issues.json";
import { VocesApp, type Issue } from "./VocesApp";

export default function Home() {
  return <VocesApp issues={issues as Issue[]} />;
}
