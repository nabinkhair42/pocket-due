/**
 * DEPRECATED — icons now live in `app/icons/` as real SVG components.
 *
 * The previous implementations rendered PNGs through <Image>: `AppLogo` used
 * assets/icon.png (the launcher icon, so it carried launcher padding and
 * blurred when scaled up), and the Google mark was a raster that couldn't
 * adapt to theme or resolution.
 *
 * Re-exported so any stale import keeps working. Safe to delete once
 * `grep -rn "components/icons" app/` comes back empty.
 */
export { AppLogo, GithubIcon, GoogleIcon } from "../icons";
