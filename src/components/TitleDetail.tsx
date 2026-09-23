'use client';

import { useState } from 'react';
import { getLanguage } from '@/catalog/languages';
import { getRegion } from '@/catalog/regions';
import type { CatalogEntry } from '@/catalog/types';
import { CoverArt } from './CoverArt';
import { ExternalLinks } from './ExternalLinks';
import { FeedAgents } from './FeedAgents';
import { FeedIcon } from './Icons';
import { LikeButton } from './LikeButton';
import { EpisodeList } from './player/EpisodeList';
import { SubscribeButton } from './SubscribeButton';
import { TranslateToggle } from './TranslateToggle';
import { TypeBadge } from './TypeBadge';

export function TitleDetail({
  entry,
  seedIds = [],
}: {
  entry: CatalogEntry;
  seedIds?: string[];
}) {
  const [translated, setTranslated] = useState(false);
  const language = getLanguage(entry.originalLanguage);
  const region = getRegion(entry.region);
  const english = entry.translations?.en;
  const showEnglish = translated && english;
  const title = showEnglish ? english.title : entry.title;
  const description = showEnglish ? english.description : entry.description;

  return (
    <article className="title-detail">
      <div className="title-hero">
        <CoverArt entry={entry} size="hero" priority />
        <div>
          <p className="eyebrow">
            <TypeBadge type={entry.type} />
            <span>{language.name}</span>
            <span>{region.name}</span>
          </p>
          <h1 lang={showEnglish ? 'en' : entry.originalLanguage}>{title}</h1>
          <p className="title-creators">{entry.creators.join(' · ')}</p>
          <div className="title-actions">
            <TranslateToggle
              enabled={translated}
              available={Boolean(english) && entry.originalLanguage !== 'en'}
              onToggle={() => setTranslated((value) => !value)}
            />
            <LikeButton id={entry.id} title={entry.title} seeds={seedIds} />
            <SubscribeButton id={entry.id} title={entry.title} />
            <a className="btn btn-primary" href="#feed-agents">
              <FeedIcon />
              Feed agents
            </a>
          </div>
          <dl className="title-facts">
            <div>
              <dt>Original language</dt>
              <dd>
                {language.name} ({language.nativeName})
              </dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>
                {region.name}, {region.continent}
              </dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>{entry.country}</dd>
            </div>
            {entry.year ? (
              <div>
                <dt>Year</dt>
                <dd>{entry.year}</dd>
              </div>
            ) : null}
            {entry.episodeCount ? (
              <div>
                <dt>Episodes (approx.)</dt>
                <dd>{entry.episodeCount}</dd>
              </div>
            ) : null}
            {entry.durationHours ? (
              <div>
                <dt>Duration (approx.)</dt>
                <dd>{entry.durationHours} hours</dd>
              </div>
            ) : null}
            <div>
              <dt>Signals</dt>
              <dd>
                Diversity {entry.signals.diversity} · Popularity{' '}
                {entry.signals.popularity}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <section className="title-copy">
        <h2>Description</h2>
        <p lang={showEnglish ? 'en' : entry.originalLanguage}>{description}</p>
        <h2>Tags</h2>
        <ul className="chip-row">
          {entry.genres.map((genre) => (
            <li key={genre} className="chip">
              {genre}
            </li>
          ))}
          {entry.tags.map((tag) => (
            <li key={tag} className="chip chip-quiet">
              {tag}
            </li>
          ))}
        </ul>
        <EpisodeList entry={entry} />
        <h2>Open externally</h2>
        <p className="lede">
          The repository stores metadata and links. Media stays with the
          publisher, feed, library, or platform.
        </p>
        <ExternalLinks entry={entry} />
        <FeedAgents entry={entry} displayedDescription={description} />
      </section>
    </article>
  );
}
