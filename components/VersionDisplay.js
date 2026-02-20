import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const tags = {
    gameVersions: [
        "1.0",
    ]
};

const mcVersionRegex = /^([0-9]+.[0-9]+)(.[0-9]+)?$/;

function formatVersion(major, minor) {
    return minor === 0 ? major : `${major}.${minor}`;
}

function groupVersions(versions, consecutive = false) {
    return versions.slice().reverse().reduce((ranges, version) => {
        const matchesVersion = version.match(mcVersionRegex);

        if(matchesVersion) {
            const majorVersion = matchesVersion[1];
            const minorVersion = matchesVersion[2];
            const minorNumeric = minorVersion ? parseInt(minorVersion.replace(".", "")) : 0;

            let prevInRange;
            if((prevInRange = ranges.find((x) => x.major === majorVersion && (!consecutive || x.minor.at(-1) === minorNumeric - 1)))) {
                prevInRange.minor.push(minorNumeric);
                return ranges;
            }

            return [...ranges, { major: majorVersion, minor: [minorNumeric] }];
        }

        return ranges;
    }, []).reverse();
}

function groupConsecutiveIndices(versions, referenceList) {
    if(!versions || versions.length === 0) {
        return [];
    }

    const referenceMap = new Map();
    referenceList.forEach((item, index) => {
        referenceMap.set(item, index);
    });

    const sortedList = versions.slice().sort((a, b) => referenceMap.get(a) - referenceMap.get(b));

    const ranges = [];
    let start = sortedList[0];
    let previous = sortedList[0];

    for(let i = 1; i < sortedList.length; i++) {
        const current = sortedList[i];
        if(referenceMap.get(current) !== referenceMap.get(previous) + 1) {
            if(start === previous) {
                ranges.push(start);
            } else {
                ranges.push(`${start}-${previous}`);
            }

            start = current;
        }

        previous = current;
    }

    if(start === previous) {
        ranges.push(start);
    } else {
        ranges.push(`${start}-${previous}`);
    }

    return ranges;
}

function formatVersionsForDisplay(gameVersions) {
    const inputVersions = gameVersions.slice();
    const allVersions = tags.gameVersions;

    const allReleases = allVersions.filter((version) => mcVersionRegex.test(version));
    const allLegacy = allVersions.filter((version) => !mcVersionRegex.test(version));

    const indices = allVersions.reduce((map, gameVersion, index) => {
        map[gameVersion] = index;
        return map;
    }, {});

    inputVersions.sort((a, b) => indices[a] - indices[b]);

    const releaseVersions = inputVersions.filter((projVer) => allReleases.includes(projVer));

    const allReleasesGrouped = groupVersions(allReleases, false);
    const projectVersionsGrouped = groupVersions(releaseVersions, true);

    const releaseVersionsAsRanges = projectVersionsGrouped.map(({ major, minor }) => {
        if(minor.length === 1) {
            return formatVersion(major, minor[0]);
        }

        if(allReleasesGrouped.find((x) => x.major === major).minor.every((value, index) => value === minor[index])) {
            return `${major}.x`;
        }

        return `${formatVersion(major, minor[0])}-${formatVersion(major, minor[minor.length - 1])}`;
    });

    const legacyVersionsAsRanges = groupConsecutiveIndices(
        inputVersions.filter((projVer) => allLegacy.includes(projVer)),
        allLegacy
    );

    const output = [...releaseVersionsAsRanges, ...legacyVersionsAsRanges];

    return output;
}

export default function VersionDisplay({ gameVersions }) {
    const t = useTranslations("ProjectPage.versions");
    const [formattedVersions, setFormattedVersions] = useState([]);

    useEffect(() => {
        if(gameVersions && Array.isArray(gameVersions)) {
            const versions = formatVersionsForDisplay(gameVersions);
            setFormattedVersions(versions);
        }
    }, [gameVersions]);

    return (
        <>
            {formattedVersions.length > 0 ? (
                formattedVersions.map((version, index) => (
                    <span key={index} className="version__game-versions">
                        {version}
                    </span>
                ))
            ) : (
                <span className="version__game-versions">{t("notSpecified")}</span>
            )}
        </>
    );
}