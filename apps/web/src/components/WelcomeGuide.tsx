import type { MessageKey } from "@/lib/i18n";
import { LAYERLING_VIDEOS } from "@/lib/layerlingVideos";

type Translate = (key: MessageKey) => string;

const STEPS = [
  ["welcome.step1Title", "welcome.step1Body"],
  ["welcome.step2Title", "welcome.step2Body"],
  ["welcome.step3Title", "welcome.step3Body"],
  ["welcome.step4Title", "welcome.step4Body"],
] as const satisfies ReadonlyArray<readonly [MessageKey, MessageKey]>;

/**
 * Everything beyond the first steps. New features belong here, in both
 * languages - the same text is what search engines read (see StaticIntro).
 */
const MORE = [
  ["welcome.moreHollowTitle", "welcome.moreHollowBody"],
  ["welcome.moreSplitTitle", "welcome.moreSplitBody"],
  ["welcome.moreSketchTitle", "welcome.moreSketchBody"],
  ["welcome.moreLibraryTitle", "welcome.moreLibraryBody"],
  ["welcome.morePatternTitle", "welcome.morePatternBody"],
  ["welcome.moreBundleTitle", "welcome.moreBundleBody"],
  ["welcome.moreWorkplaneTitle", "welcome.moreWorkplaneBody"],
  ["welcome.morePlaceTitle", "welcome.morePlaceBody"],
  ["welcome.moreSnapTitle", "welcome.moreSnapBody"],
  ["welcome.moreWindowsTitle", "welcome.moreWindowsBody"],
  ["welcome.morePivotTitle", "welcome.morePivotBody"],
  ["welcome.moreLayFlatTitle", "welcome.moreLayFlatBody"],
  ["welcome.moreMeasureTitle", "welcome.moreMeasureBody"],
  ["welcome.moreBackupTitle", "welcome.moreBackupBody"],
  ["welcome.morePrintersTitle", "welcome.morePrintersBody"],
  ["welcome.moreImportTitle", "welcome.moreImportBody"],
  ["welcome.moreOfflineTitle", "welcome.moreOfflineBody"],
  ["welcome.moreAiTitle", "welcome.moreAiBody"],
] as const satisfies ReadonlyArray<readonly [MessageKey, MessageKey]>;

/** The body of the welcome panel on the start page. */
export function WelcomeGuideBody({ tr }: { tr: Translate }) {
  return (
    <>
      <p>{tr("welcome.lead")}</p>
      <p className="dashboard-welcome-switch">
        <strong>{tr("welcome.switchTitle")}</strong> {tr("welcome.switchBody")}
      </p>
      <ol>
        {STEPS.map(([title, body]) => (
          <li key={title}>
            <strong>{tr(title)}</strong>
            <span>{tr(body)}</span>
          </li>
        ))}
      </ol>
      <div className="dashboard-welcome-more">
        <h3>{tr("welcome.moreTitle")}</h3>
        <ul>
          {MORE.map(([title, body]) => (
            <li key={title}>
              <strong>{tr(title)}:</strong> {tr(body)}
            </li>
          ))}
        </ul>
      </div>
      <div className="dashboard-welcome-more dashboard-welcome-videos">
        <h3>{tr("welcome.videosTitle")}</h3>
        <ul>
          {LAYERLING_VIDEOS.map((video) => (
            <li key={video.url}>
              <a href={video.url} target="_blank" rel="noopener noreferrer">
                {video.title}
              </a>{" "}
              <span className="dashboard-welcome-video-meta">
                {video.channel} · {video.lang}
              </span>
            </li>
          ))}
        </ul>
        <p className="dashboard-welcome-help">{tr("welcome.videosHint")}</p>
      </div>
      <p className="dashboard-welcome-help">{tr("welcome.help")}</p>
      <a className="dashboard-welcome-guide-link" href={tr("welcome.guideUrl")}>
        {tr("welcome.guideLink")}
        <span aria-hidden="true">&rarr;</span>
      </a>
    </>
  );
}
