{
  description = "kei's dotfiles - Nix configuration";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nix-darwin = {
      url = "github:LnL7/nix-darwin";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, nix-darwin, ... }:
    let
      # ホスト名のリスト: hosts/<hostname>.nix があれば自動検出
      # 新しいマシンは setup/10_nix.sh が自動で hosts/<hostname>.nix を作成する
      hostFiles = builtins.filter
        (name: name != "common.nix" && builtins.match ".*\\.nix" name != null)
        (builtins.attrNames (builtins.readDir ./hosts));

      mkDarwinConfig = fileName:
        let hostname = builtins.replaceStrings [ ".nix" ] [ "" ] fileName;
        in {
          name = hostname;
          value = nix-darwin.lib.darwinSystem {
            system = "aarch64-darwin";
            modules = [
              ./hosts/common.nix
              (./hosts + "/${fileName}")
            ];
          };
        };
    in
    {
      darwinConfigurations = builtins.listToAttrs (map mkDarwinConfig hostFiles);
    };
}
