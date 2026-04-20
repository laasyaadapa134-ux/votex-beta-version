"""
WLASL Video ID Lookup
Extracts video IDs from WLASL_v0.3.json for ASL word glosses
"""
import json
from pathlib import Path


def get_video_id(gloss_word):
    """
    Get the video ID for a given ASL gloss word from WLASL dataset.
    
    Args:
        gloss_word (str): The ASL gloss word to search for (case-insensitive)
        
    Returns:
        str: The video_id of the first instance, or None if not found
    """
    json_path = Path(__file__).parent / 'WLASL-master' / 'start_kit' / 'WLASL_v0.3.json'
    # Fallback if unzipped differently
    if not json_path.exists():
        json_path = Path(__file__).parent / 'WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json'
    
    # Check if file exists
    if not json_path.exists():
        print(f"Error: JSON file not found at {json_path}")
        return None
    
    try:
        # Load the JSON file
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Normalize the search term to uppercase for case-insensitive comparison
        search_gloss = gloss_word.strip().upper()
        
        # Search through the list of entries
        for entry in data:
            if entry.get('gloss', '').upper() == search_gloss:
                # Found matching gloss, get first instance's video_id
                instances = entry.get('instances', [])
                if instances and len(instances) > 0:
                    video_id = instances[0].get('video_id')
                    return video_id
                else:
                    print(f"Warning: Gloss '{gloss_word}' found but has no instances")
                    return None
        
        # Word not found
        return None
        
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON file: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


def get_all_instances(gloss_word):
    """
    Get ALL video IDs for a given ASL gloss word (some words have multiple videos).
    
    Args:
        gloss_word (str): The ASL gloss word to search for (case-insensitive)
        
    Returns:
        list: List of video_ids, or empty list if not found
    """
    json_path = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
    
    if not json_path.exists():
        print(f"Error: JSON file not found at {json_path}")
        return []
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        search_gloss = gloss_word.strip().upper()
        
        for entry in data:
            if entry.get('gloss', '').upper() == search_gloss:
                instances = entry.get('instances', [])
                video_ids = [inst.get('video_id') for inst in instances if inst.get('video_id')]
                return video_ids
        
        return []
        
    except Exception as e:
        print(f"Error: {e}")
        return []


def search_glosses(partial_word):
    """
    Search for glosses containing the partial word.
    
    Args:
        partial_word (str): Partial word to search for
        
    Returns:
        list: List of matching glosses
    """
    json_path = Path('C:/Users/prasa/Downloads/WLASL-master/WLASL-master/start_kit/WLASL_v0.3.json')
    
    if not json_path.exists():
        print(f"Error: JSON file not found at {json_path}")
        return []
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        search_term = partial_word.strip().upper()
        matches = []
        
        for entry in data:
            gloss = entry.get('gloss', '')
            if search_term in gloss.upper():
                instance_count = len(entry.get('instances', []))
                matches.append(f"{gloss} ({instance_count} videos)")
        
        return matches
        
    except Exception as e:
        print(f"Error: {e}")
        return []


# Test the function
if __name__ == "__main__":
    print("=" * 60)
    print("WLASL Video ID Lookup Test")
    print("=" * 60)
    print()
    
    # Test 1: Look up 'apple'
    print("Test 1: get_video_id('apple')")
    video_id = get_video_id('apple')
    if video_id:
        print(f"✓ Found video ID: {video_id}")
    else:
        print("✗ Not found")
    print()
    
    # Test 2: Get all instances for 'apple'
    print("Test 2: get_all_instances('apple')")
    all_ids = get_all_instances('apple')
    print(f"Found {len(all_ids)} video(s): {all_ids[:5]}")  # Show first 5
    print()
    
    # Test 3: Try some common words
    print("Test 3: Common ASL words")
    common_words = ['hello', 'thank', 'you', 'please', 'help']
    for word in common_words:
        vid = get_video_id(word)
        if vid:
            print(f"  {word.upper():10s} → {vid}")
        else:
            print(f"  {word.upper():10s} → Not found")
    print()
    
    # Test 4: Search for words containing 'app'
    print("Test 4: Search for glosses containing 'app'")
    matches = search_glosses('app')
    for match in matches[:10]:  # Show first 10
        print(f"  - {match}")
    print()
    
    print("=" * 60)
