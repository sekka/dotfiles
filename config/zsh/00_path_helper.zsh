# PATH management helper functions

# Function to add a directory to PATH only if it exists and is not already in PATH
add_to_path() {
    local dir="$1"
    local position="${2:-prepend}"  # prepend or append
    
    # Check if directory exists
    if [[ ! -d "$dir" ]]; then
        return 1
    fi
    
    # Check if already in PATH
    case ":$PATH:" in
        *":$dir:"*) return 0 ;;  # Already in PATH
    esac
    
    # Add to PATH
    if [[ "$position" == "append" ]]; then
        export PATH="$PATH:$dir"
    else
        export PATH="$dir:$PATH"
    fi
}

# Function to add a directory to fpath only if it exists and is not already in fpath
add_to_fpath() {
    local dir="$1"
    
    # Check if directory exists
    if [[ ! -d "$dir" ]]; then
        return 1
    fi
    
    # Check if already in fpath
    local already_in_fpath=false
    for fp in $fpath; do
        if [[ "$fp" == "$dir" ]]; then
            already_in_fpath=true
            break
        fi
    done
    
    if [[ "$already_in_fpath" == false ]]; then
        fpath=("$dir" $fpath)
    fi
}