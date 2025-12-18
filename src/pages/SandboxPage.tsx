/**
 * SandboxPage - Debug page for HeaderSlideshow image loading system.
 *
 * Demonstrates:
 * 1. All images found in manifest
 * 2. Which images are used for each screen/campaign combination
 * 3. Live preview of header with slideshow
 */

import { useState, useEffect } from 'react';
import { Panel, PanelHeader } from '@engine/ui/components/panel';
import { logger } from '@engine/services';
import { gameImagesDir } from '@public';

// Types
type SlideshowScreen = 'start' | 'play' | 'won' | 'took' | 'lost';

interface ImageManifest {
  images?: string[];
  start?: { images?: string[] };
  play?: {
    images?: string[];
    easy?: { images?: string[] };
    medium?: { images?: string[] };
    hard?: { images?: string[] };
  };
  end?: {
    images?: string[];
    won?: { images?: string[] };
    took?: { images?: string[] };
    lost?: { images?: string[] };
  };
  campaigns?: Record<string, ImageManifest>;
}

interface ResolvedImages {
  images: string[];
  subfolder: string;
  source: string;
}

const GAME_ID = 'bg3';
const BASE_PATH = gameImagesDir(GAME_ID);

export default function SandboxPage() {
  const [manifest, setManifest] = useState<ImageManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<SlideshowScreen>('start');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load manifest
  useEffect(() => {
    async function loadManifest() {
      try {
        const response = await fetch(`${BASE_PATH}/manifest.json`);
        if (!response.ok) {
          throw new Error(`Failed to load manifest: ${response.status}`);
        }
        const data = await response.json();
        setManifest(data);
        logger.assetLoader.info('Loaded manifest for SandboxPage', {
          games: Object.keys(data?.games ?? {}),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadManifest();
  }, []);

  // Get images for a specific screen with fallback logic
  function getImagesForScreen(
    m: ImageManifest | null,
    screen: SlideshowScreen,
    campaignId?: string
  ): ResolvedImages {
    if (!m) return { images: [], subfolder: '', source: 'none' };

    // Helper for start fallback
    const getStartFallback = (): ResolvedImages => ({
      images: m.start?.images || [],
      subfolder: 'start',
      source: 'fallback to start',
    });

    // If campaign specified, try campaign-specific first
    if (campaignId && m.campaigns?.[campaignId]) {
      const campaignManifest = m.campaigns[campaignId];
      const campaignResult = getImagesForScreenInternal(campaignManifest, screen);
      if (campaignResult.images.length > 0) {
        return {
          ...campaignResult,
          subfolder: `campaigns/${campaignId}/${campaignResult.subfolder}`,
          source: `campaign: ${campaignId}`,
        };
      }
    }

    return getImagesForScreenInternal(m, screen);

    function getImagesForScreenInternal(
      manifest: ImageManifest,
      scr: SlideshowScreen
    ): ResolvedImages {
      switch (scr) {
        case 'start':
          return {
            images: manifest.start?.images || [],
            subfolder: 'start',
            source: 'start folder',
          };

        case 'play':
          if (manifest.play?.images?.length) {
            return {
              images: manifest.play.images,
              subfolder: 'play',
              source: 'play folder',
            };
          }
          return { ...getStartFallback(), source: 'play → fallback to start' };

        case 'won':
          if (manifest.end?.won?.images?.length) {
            return {
              images: manifest.end.won.images,
              subfolder: 'end/won',
              source: 'end/won folder',
            };
          }
          if (manifest.end?.images?.length) {
            return {
              images: manifest.end.images,
              subfolder: 'end',
              source: 'won → fallback to end',
            };
          }
          return { ...getStartFallback(), source: 'won → fallback to start' };

        case 'took':
          if (manifest.end?.took?.images?.length) {
            return {
              images: manifest.end.took.images,
              subfolder: 'end/took',
              source: 'end/took folder',
            };
          }
          if (manifest.end?.images?.length) {
            return {
              images: manifest.end.images,
              subfolder: 'end',
              source: 'took → fallback to end',
            };
          }
          return { ...getStartFallback(), source: 'took → fallback to start' };

        case 'lost':
          if (manifest.end?.lost?.images?.length) {
            return {
              images: manifest.end.lost.images,
              subfolder: 'end/lost',
              source: 'end/lost folder',
            };
          }
          if (manifest.end?.images?.length) {
            return {
              images: manifest.end.images,
              subfolder: 'end',
              source: 'lost → fallback to end',
            };
          }
          return { ...getStartFallback(), source: 'lost → fallback to start' };

        default:
          return { images: [], subfolder: '', source: 'unknown' };
      }
    }
  }

  // Get all campaigns from manifest
  const campaigns = manifest?.campaigns ? Object.keys(manifest.campaigns) : [];

  // Get resolved images for current selection
  const resolved = getImagesForScreen(
    manifest,
    selectedScreen,
    selectedCampaign || undefined
  );

  // Build full image path
  const getFullPath = (subfolder: string, filename: string) => {
    return `${BASE_PATH}/${subfolder}/${filename}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl mb-4">Loading manifest...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl mb-4 text-red-500">Error: {error}</h1>
        <pre className="bg-gray-800 p-4 rounded">
          Attempted to load: {BASE_PATH}/manifest.json
        </pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        🖼️ HeaderSlideshow Sandbox (BG3)
      </h1>

      {/* Manifest JSON */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📄 Raw Manifest</h2>
        <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">
          {JSON.stringify(manifest, null, 2)}
        </pre>
      </section>

      {/* All Images Found */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🖼️ All Images in Manifest</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Start images */}
          {manifest?.start?.images?.map((img) => (
            <ImageCard
              key={`start-${img}`}
              path={getFullPath('start', img)}
              label={`start/${img}`}
              usedFor="StartScreen"
              onClick={() => setPreviewImage(getFullPath('start', img))}
            />
          ))}

          {/* End images */}
          {manifest?.end?.images?.map((img) => (
            <ImageCard
              key={`end-${img}`}
              path={getFullPath('end', img)}
              label={`end/${img}`}
              usedFor="EndScreen (won/took/lost fallback)"
              onClick={() => setPreviewImage(getFullPath('end', img))}
            />
          ))}

          {/* Campaign images */}
          {campaigns.map((campaignId) => {
            const campaign = manifest?.campaigns?.[campaignId];
            return campaign?.start?.images?.map((img) => (
              <ImageCard
                key={`campaign-${campaignId}-${img}`}
                path={getFullPath(`campaigns/${campaignId}/start`, img)}
                label={`campaigns/${campaignId}/start/${img}`}
                usedFor={`StartScreen (campaign: ${campaignId})`}
                onClick={() =>
                  setPreviewImage(
                    getFullPath(`campaigns/${campaignId}/start`, img)
                  )
                }
              />
            ));
          })}
        </div>
      </section>

      {/* Screen Selector */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🎮 Test Image Resolution</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Screen:</label>
            <select
              value={selectedScreen}
              onChange={(e) =>
                setSelectedScreen(e.target.value as SlideshowScreen)
              }
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
            >
              <option value="start">start</option>
              <option value="play">play</option>
              <option value="won">won</option>
              <option value="took">took</option>
              <option value="lost">lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Campaign:</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
            >
              <option value="">(none)</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p className="mb-2">
            <strong>Resolution path:</strong>{' '}
            <span className="text-yellow-400">{resolved.source}</span>
          </p>
          <p className="mb-2">
            <strong>Subfolder:</strong>{' '}
            <code className="bg-gray-700 px-2 py-1 rounded">
              {resolved.subfolder || '(none)'}
            </code>
          </p>
          <p className="mb-2">
            <strong>Images found:</strong> {resolved.images.length}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {resolved.images.map((img) => (
              <button
                key={img}
                onClick={() =>
                  setPreviewImage(getFullPath(resolved.subfolder, img))
                }
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
              >
                {img}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Header Preview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          🎨 Header Preview (with slideshow image)
        </h2>

        {previewImage ? (
          <Panel className="p-1 relative overflow-hidden">
            {/* Slideshow layer */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${previewImage})`,
                opacity: 0.35,
                mixBlendMode: 'screen',
                filter: 'saturate(1.2) brightness(1.1)',
              }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
              }}
            />

            <PanelHeader>✦ ДРЕВНИЙ СВИТОК ✦ СРОЧНЫЙ КВЕСТ ✦</PanelHeader>
            <div className="p-4 text-center relative z-10">
              <h1
                className="text-2xl md:text-3xl font-bold tracking-wider mb-1 text-amber-100"
                style={{
                  textShadow:
                    '0 0 15px rgba(255,191,0,0.8), 0 0 30px rgba(184,134,11,0.6), 2px 2px 4px #000',
                  fontFamily: 'Georgia, serif',
                }}
              >
                КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ
              </h1>
              <h2
                className="text-lg tracking-wide text-amber-100"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontStyle: 'italic',
                }}
              >
                BALDUR'S GATE 3 EDITION
              </h2>
            </div>
          </Panel>
        ) : (
          <div className="bg-gray-800 p-8 rounded text-center text-gray-400">
            👆 Click on an image above to preview it in the header
          </div>
        )}

        {previewImage && (
          <p className="mt-2 text-sm text-gray-400">
            Preview image: <code>{previewImage}</code>
          </p>
        )}
      </section>

      {/* Full size preview */}
      {previewImage && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔍 Full Image</h2>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full h-auto rounded border border-gray-600"
            style={{ maxHeight: '400px' }}
          />
        </section>
      )}
    </div>
  );
}

// Image card component
function ImageCard({
  path,
  label,
  usedFor,
  onClick,
}: {
  path: string;
  label: string;
  usedFor: string;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className="bg-gray-800 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
      onClick={onClick}
    >
      <div className="h-32 bg-gray-700 relative">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Loading...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            ❌ Failed to load
          </div>
        )}
        <img
          src={path}
          alt={label}
          className={`w-full h-full object-cover ${loaded ? '' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
      <div className="p-2">
        <p className="text-xs font-mono text-gray-300 truncate" title={label}>
          {label}
        </p>
        <p className="text-xs text-green-400 mt-1">{usedFor}</p>
      </div>
    </div>
  );
}
