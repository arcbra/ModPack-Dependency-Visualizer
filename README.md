<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<div align="left">
  <img src=/src/imgs/index_window_icon.svg width=128>
</div>
<br>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#modpack-dependency-visualizer">ModPack Dependency Visualizer</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#limitations">Limitations</a></li>
    <li><a href="#further-work">Further Work</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#donations">Donations</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## ModPack Dependency Visualizer

Don't you hate when you are making a modpack and after adding and removing mods for a while, you don't know if you left unnecessary mods? **Well, this tool aims to solve this!**

This project makes use of the manifest inside the minecraft mods in JAR format. This makes it possible to establish relations between the mods and generate a network graph, so you can clearly see which mods are left alone and how the connections are established. Here is an example of the Cobblemon ModPack [NeoForge]:

<img src=/imgs/cobblemon_neoforge.png alt="Cobblemon ModPack Graph">

## Usage

<img src=/src/imgs/graph_window_icon.svg alt="Graph icon" width=128>

Go to the [official-url] to use this app!

Once you load your mods, you may notice the nodes have different colors depending on the connections they have. Not all colors appear by default; some are toggled by double-clicking the node. Here is how it works:

- ${\color{blue}\text{Blue}}$ indicates this mod is a *Main* mod. This means arrows can only go from this mod to another, but not the other way around.
- ${\color{orange}\text{Orange}}$ indicates this mod is a *Midpoint* mod. This means arrows can go from this mod to another and vice versa.
- ${\color{Yellow}\text{Yellow}}$ indicates this mod is a *Dependency* mod. This means arrows can only go to this mod, but there are no arrows coming from this mod.
- ${\color{purple}\text{Purple}}$ indicates this mod is a *Addon* mod. This is a toggle for non-orphan-only nodes. Really useful when working with mods with massive addons such as the Create mod.
- ${\color{red}\text{Red}}$ indicates this mod is an *Orphan* mod. This means this mod doesn't have any sort of connections with other mods. This doesn't necessarily mean it's a useless dependency, so it may need to be checked out.
- ${\color{green}\text{Green}}$ indicates this mod is a *Checked orphan* mod. This is a toggle for orphan-only nodes. Useful when checking out useless dependencies.

Also, you can click any node and move it with its group around for organization. Finally, **you can right click any node to search it on CurseForge**, and read about it. If it's your first time loading the website, you'll be prompted with this little reminder:

<img src=/imgs/clicks_notification.png alt="How clicks work" width=512>

## Limitations

The manifest used to describe all the mod components in any format was standardized in Minecraft version 1.14. So **if your modpack is in a version lower than 1.14, this tool may not work properly!**

## Further Work

- [x] Add the ability to mark orphan nodes as checked orphans.
- [x] Add the ability to mark non-orphan nodes if they are addons.
- [x] Search the mods on CurseForge from the nodes.
- [ ] Add an option to save the graph as a file.
- [ ] Add an option to load a graph from a file.

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Any contributions you make are **greatly appreciated**!

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue explaining the problem.
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Donations

Feel free to buy me a coffee if you want to! **I would highly appreciate your support** and it will encourage this project to keep growing even more.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)][buymeacoffe-url]

## License

Distributed under the GNU General Public License, version 3 or later. See the `LICENSE` file for more information.

<!-- CONTACT -->

## Contact

You can contact me on my email arcbaedl@gmail.com.

Project Link: [arcbra/ModPack-Dependency-Visualizer][this-repo].

<!-- ACKNOWLEDGMENTS -->

## Built With

- [![HTML][HTML.js]][HTML-url]
- [![Typescript][Typescript.js]][Typescript-url]
- [![CSSS][CSS.js]][CSS-url]

## Acknowledgments

This project was heavily inspired by some other _ModPack makers_ projects, and it's meant to complement them, so check them out!

- [Modpack Resolver](https://github.com/iTrooz/ModpackResolver)
- [MODPACK INDEX](https://www.modpackindex.com/modpacks)

I also want to express my gratitude to the libraries that made this project possible. Huge thanks to the [vis.js](https://visjs.org/) and [Progress Bar.js](https://kimmobrunfeldt.github.io/progressbar.js/) among others.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[index-page-picture]: /src/imgs/index_window_icon.svg
[graph-page-picture]: /src/imgs/graph_window_icon.svg
[official-url]: https://blank
[buymeacoffe-url]: https://buymeacoffee.com/arcbaedlb
[this-repo]: https://github.com/arcbra/ModPack-Dependency-Visualizer
[HTML.js]: https://shields.io/badge/HTML5-E34F26?logo=HTML5&logoColor=FFF
[HTML-url]: https://www.typescriptlang.org/
[Typescript.js]: https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF
[Typescript-url]: https://www.typescriptlang.org/
[CSS.js]: https://img.shields.io/badge/CSS-639?logo=css&logoColor=fff
[CSS-url]: https://www.typescriptlang.org/
