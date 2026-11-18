import * as React from "react";
import { Route, Switch, useLocation } from "wouter";
import { AboutPage } from "@/components/about";
import { NotFoundPage } from "@/components/not-found";
import { AppProviders } from "@/components/providers";
import { BranchScreen } from "@/components/screens/branch";
import { HomeScreen } from "@/components/screens/home";
import { MapScreen } from "@/components/screens/map";
import { MeScreen } from "@/components/screens/me";
import { TicketScreen } from "@/components/screens/ticket";
import { StoryPage } from "@/components/story";
import { BANKS, getBranch } from "@/lib/data";
import { usePageMeta, type PageMeta } from "@/lib/meta";

function Page({ children, ...meta }: PageMeta & { children: React.ReactNode }) {
  usePageMeta(meta);
  return children;
}

function NotFound() {
  return (
    <Page title="Page not found" noindex>
      <NotFoundPage />
    </Page>
  );
}

function Branch({ id }: { id: string }) {
  const branch = getBranch(id);
  if (!branch) return <NotFound />;
  const name = `${BANKS[branch.bank].name.en} ${branch.name.en}`;
  return (
    <Page
      title={name}
      description={`Live queue, crowd by hour and directions for ${name}. ${branch.address.en}.`}
    >
      <BranchScreen key={id} id={id} />
    </Page>
  );
}

// Back and forward leave scrolling to the browser; any other navigation starts at the top.
let poppedTo: string | null = null;
window.addEventListener("popstate", () => {
  poppedTo = window.location.pathname;
});

function ScrollToTop() {
  const [path] = useLocation();
  const previous = React.useRef(path);
  React.useLayoutEffect(() => {
    const popped = poppedTo === path;
    poppedTo = null;
    if (previous.current === path) return;
    previous.current = path;
    if (!popped) window.scrollTo(0, 0);
  }, [path]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/about">
          <Page
            title="About"
            description="What Dash Hour is for: take a bank's queue number before you arrive, see how busy each branch is, and show up as your number is called."
          >
            <AboutPage />
          </Page>
        </Route>
        <Route path="/story">
          <Page
            title="From sketch to prototype"
            description="How Dash Hour, winner of the first BlueHack Samsung Hackathon in 2016, went from six notepad sketches to a working web and mobile prototype."
          >
            <StoryPage />
          </Page>
        </Route>
        {/* App screens and the 404 share one shell, so its state survives moving between them. */}
        <Route>
          <AppProviders>
            <Switch>
              <Route path="/">
                <Page>
                  <HomeScreen />
                </Page>
              </Route>
              <Route path="/map">
                <Page title="Map">
                  <MapScreen />
                </Page>
              </Route>
              <Route path="/ticket">
                <Page title="My ticket">
                  <TicketScreen />
                </Page>
              </Route>
              <Route path="/me">
                <Page title="Account">
                  <MeScreen />
                </Page>
              </Route>
              <Route path="/branch/:id">{({ id }) => <Branch id={id} />}</Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </AppProviders>
        </Route>
      </Switch>
    </>
  );
}
