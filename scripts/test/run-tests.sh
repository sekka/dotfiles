#!/usr/bin/env bash
# テスト実行ヘルパースクリプト

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$SCRIPT_DIR/../../tests"

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 使用方法
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Run AI Orchestration test suite.

OPTIONS:
    -h, --help          Show this help message
    -u, --unit          Run unit tests only
    -i, --integration   Run integration tests only
    -f, --file FILE     Run specific test file
    -v, --verbose       Verbose output (--tap)
    -c, --coverage      Show test coverage summary

EXAMPLES:
    # Run all tests
    $(basename "$0")

    # Run unit tests only
    $(basename "$0") --unit

    # Run specific test file
    $(basename "$0") --file tests/unit/test_ai_interface.bats

    # Verbose output
    $(basename "$0") --verbose
EOF
  exit 0
}

# bats-core 存在確認
check_dependencies() {
  if ! command -v bats >/dev/null 2>&1; then
    echo -e "${RED}ERROR: bats-core not installed${NC}"
    echo "Install with: brew install bats-core"
    exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}WARNING: jq not installed. Some tests will be skipped.${NC}"
    echo "Install with: brew install jq"
  fi

  if ! command -v gtimeout >/dev/null 2>&1 && ! command -v timeout >/dev/null 2>&1; then
    echo -e "${YELLOW}WARNING: timeout command not available. Some tests will be skipped.${NC}"
    echo "Install with: brew install coreutils"
  fi
}

# テスト実行
run_tests() {
  local test_files=("$@")

  if [[ ${#test_files[@]} -eq 0 ]]; then
    echo -e "${RED}No test files found${NC}"
    exit 1
  fi

  echo -e "${GREEN}Running ${#test_files[@]} test file(s)...${NC}"

  if [[ $VERBOSE == "1" ]]; then
    bats --tap "${test_files[@]}"
  else
    bats "${test_files[@]}"
  fi

  local exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    echo -e "${GREEN}✓ All tests passed${NC}"
  else
    echo -e "${RED}✗ Some tests failed${NC}"
  fi

  return $exit_code
}

# テストカバレッジサマリー
show_coverage() {
  cat <<EOF

${GREEN}Test Coverage Summary${NC}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Tests: 77

Unit Tests (42):
  - test_ai_availability.bats: 18 tests
  - test_ai_check.bats:        14 tests
  - test_ai_interface.bats:    10 tests

Integration Tests (35):
  - test_agent_orchestration.bats: 15 tests
  - test_parallel_reviewer.bats:   20 tests

Coverage Areas:
  ✓ JSON injection prevention
  ✓ Cache freshness checks
  ✓ Authentication revalidation patterns
  ✓ Cross-platform stat command support
  ✓ Environment variable inheritance/export
  ✓ parallel-reviewer AI detection logic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
}

# メイン処理
main() {
  VERBOSE=0
  SHOW_COVERAGE=0
  TEST_TYPE="all"
  SPECIFIC_FILE=""

  # 引数解析
  while [[ $# -gt 0 ]]; do
    case "$1" in
    -h | --help)
      usage
      ;;
    -u | --unit)
      TEST_TYPE="unit"
      shift
      ;;
    -i | --integration)
      TEST_TYPE="integration"
      shift
      ;;
    -f | --file)
      SPECIFIC_FILE="$2"
      shift 2
      ;;
    -v | --verbose)
      VERBOSE=1
      shift
      ;;
    -c | --coverage)
      SHOW_COVERAGE=1
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      usage
      ;;
    esac
  done

  # 依存関係チェック
  check_dependencies

  # カバレッジ表示のみ
  if [[ $SHOW_COVERAGE == "1" ]]; then
    show_coverage
    exit 0
  fi

  # テストファイル選択
  local test_files=()

  if [[ -n $SPECIFIC_FILE ]]; then
    if [[ ! -f $SPECIFIC_FILE ]]; then
      echo -e "${RED}Test file not found: $SPECIFIC_FILE${NC}"
      exit 1
    fi
    test_files=("$SPECIFIC_FILE")
  elif [[ $TEST_TYPE == "unit" ]]; then
    test_files=("$TESTS_DIR"/unit/*.bats)
  elif [[ $TEST_TYPE == "integration" ]]; then
    test_files=("$TESTS_DIR"/integration/*.bats)
  else
    test_files=("$TESTS_DIR"/unit/*.bats "$TESTS_DIR"/integration/*.bats)
  fi

  # テスト実行
  run_tests "${test_files[@]}"
}

main "$@"
