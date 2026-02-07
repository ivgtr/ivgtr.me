"use client";

import {
  faTwitter,
  faBluesky,
  faGithub,
  faSteam,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

const accounts = [
  { title: "Twitter", url: "https://twitter.com/ivgtr", icon: faTwitter },
  { title: "Bluesky", url: "https://bsky.app/profile/ivgtr.me", icon: faBluesky },
  { title: "Github", url: "https://github.com/ivgtr", icon: faGithub },
  { title: "Steam", url: "https://steamcommunity.com/id/oyanmi", icon: faSteam },
];

export const ProfileWindow = () => {
  return (
    <div className="os-profile">
      <div className="os-profile-header">
        <div className="os-profile-icon">
          <Image
            src="/icon.png"
            alt="ivgtr"
            width={80}
            height={80}
            className="object-cover"
            priority
          />
        </div>
        <div className="os-profile-info">
          <div className="os-terminal-line">
            <span className="os-prompt">$</span> whoami
          </div>
          <div className="os-terminal-output">ivgtr</div>
          <div className="os-terminal-line">
            <span className="os-prompt">$</span> cat birthday.txt
          </div>
          <div className="os-terminal-output">1996/11/12</div>
        </div>
      </div>

      <div className="os-profile-section">
        <div className="os-terminal-line">
          <span className="os-prompt">$</span> cat likes.json
        </div>
        <div className="os-terminal-output os-json">
          <div>{`{`}</div>
          <div>&nbsp;&nbsp;{`"games": "Dark Souls / ランスシリーズ",`}</div>
          <div>&nbsp;&nbsp;{`"music": "藤井風 / 星野源",`}</div>
          <div>&nbsp;&nbsp;{`"anime": "アイカツ! / プリティーリズム・レインボーライブ / 輪るピングドラム"`}</div>
          <div>{`}`}</div>
        </div>
      </div>

      <div className="os-profile-links">
        {accounts.map((account) => (
          <a
            key={account.title}
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className="os-profile-link-btn"
            title={account.title}
          >
            <FontAwesomeIcon icon={account.icon} />
          </a>
        ))}
      </div>
    </div>
  );
};
