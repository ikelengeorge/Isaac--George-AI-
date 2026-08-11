export async function handleMediaCommand(command, prompt, hasFile = false) {
  switch (command) {
    case ".nano":
      if (!hasFile) return "📷 Please attach an image to edit.";
      return `🖼️ Image editing requested:\n${prompt}`;

    case ".pixai":
      return `🎨 Image generation requested:\n${prompt}`;

    case ".videofx":
      if (!hasFile) return "🎬 Please attach a video to edit.";
      return `🎬 Video editing requested:\n${prompt}`;

    case ".videogen":
      return `🎥 Video generation requested:\n${prompt}`;

    default:
      return null;
  }
}
