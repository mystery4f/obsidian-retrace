import { App, PluginSettingTab, Setting } from "obsidian";
import type RetracePlugin from "../main";

export class RetraceSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: RetracePlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("p", {
			text:
				"Retrace binds Ctrl+E, Ctrl+Shift+E and Ctrl+F12 by default. " +
				"Ctrl+E also toggles reading view in Obsidian — rebind whichever you prefer in Settings → Hotkeys.",
		});

		new Setting(containerEl)
			.setName("Max recent files")
			.setDesc("Entries kept in the recent files panel.")
			.addText((text) =>
				text
					.setValue(String(this.plugin.data.settings.maxRecentFiles))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (Number.isFinite(parsed) && parsed > 0) {
							this.plugin.data.settings.maxRecentFiles = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Max recent locations")
			.setDesc("Entries kept in the recent locations panel.")
			.addText((text) =>
				text
					.setValue(String(this.plugin.data.settings.maxRecentLocations))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (Number.isFinite(parsed) && parsed > 0) {
							this.plugin.data.settings.maxRecentLocations = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Preview lines")
			.setDesc("Lines shown above and below a recent location.")
			.addText((text) =>
				text
					.setValue(String(this.plugin.data.settings.previewLines))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (Number.isFinite(parsed) && parsed >= 0) {
							this.plugin.data.settings.previewLines = parsed;
							await this.plugin.saveSettings();
						}
					})
			);
	}
}
