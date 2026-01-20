-- yazi 初期化スクリプト
-- https://yazi-rs.github.io/docs/configuration/overview

-- プラグインの初期化
require("full-border"):setup()
require("git"):setup()

-- カスタムステータスバー（Git情報とシンボリックリンク表示）
function Status:name()
  local h = self._tab.current.hovered
  if not h then
    return ui.Line {}
  end

  local linked = ""
  if h.link_to ~= nil then
    linked = " -> " .. tostring(h.link_to)
  end

  return ui.Line(" " .. h.name .. linked)
end

-- ホバー中のファイルのGitステータスを表示
function Status:githead()
  local h = self._tab.current.hovered
  if h == nil or ya.target_family() ~= "unix" then
    return ui.Line {}
  end

  return ui.Line {}
end
