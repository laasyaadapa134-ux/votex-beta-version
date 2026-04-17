/**
 * Simplified GLTFLoader for Three.js r150
 * Loads GLTF/GLB files and extracts basic geometry and bones
 */
(function() {
    
    THREE.GLTFLoader = function(manager) {
        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        this.path = '';
    };

    THREE.GLTFLoader.prototype = {
        constructor: THREE.GLTFLoader,

        setPath: function(value) {
            this.path = value;
            return this;
        },

        load: function(url, onLoad, onProgress, onError) {
            const scope = this;
            const loader = new THREE.FileLoader(scope.manager);
            loader.setPath(scope.path);
            loader.setResponseType('text');

            loader.load(url, function(text) {
                try {
                    scope.parse(text, scope.path || './', onLoad, onError);
                } catch (e) {
                    if (onError) {
                        onError(e);
                    } else {
                        console.error('GLTFLoader: ', e);
                    }
                    scope.manager.itemError(url);
                }
            }, onProgress, onError);

            scope.manager.itemStart(url);
        },

        parse: function(text, path, onLoad, onError) {
            const scope = this;
            
            try {
                const json = JSON.parse(text);
                
                // Load buffers
                const buffers = [];
                const promises = [];
                
                if (json.buffers) {
                    json.buffers.forEach((bufferDef, bufferIndex) => {
                        if (bufferDef.uri) {
                            const uri = path + bufferDef.uri;
                            const promise = new Promise((resolve, reject) => {
                                const loader = new THREE.FileLoader();
                                loader.setResponseType('arraybuffer');
                                loader.load(uri, 
                                    (buffer) => {
                                        buffers[bufferIndex] = buffer;
                                        resolve();
                                    },
                                    undefined,
                                    reject
                                );
                            });
                            promises.push(promise);
                        }
                    });
                }
                
                Promise.all(promises).then(() => {
                    scope.parseGLTF(json, buffers, onLoad, onError);
                }).catch((error) => {
                    if (onError) onError(error);
                });
                
            } catch (error) {
                console.error('Error parsing GLTF:', error);
                if (onError) {
                    onError(error);
                }
            }
        },

        parseGLTF: function(json, buffers, onLoad, onError) {
            const scope = this;
            
            console.log('Parsing GLTF JSON:', json);
            
            // Step 1: Parse bufferViews (slices of binary data)
            const bufferViews = [];
            if (json.bufferViews) {
                json.bufferViews.forEach((viewDef, index) => {
                    bufferViews[index] = {
                        buffer: buffers[viewDef.buffer || 0],
                        byteOffset: viewDef.byteOffset || 0,
                        byteLength: viewDef.byteLength,
                        byteStride: viewDef.byteStride,
                        target: viewDef.target
                    };
                });
            }
            console.log('Parsed', bufferViews.length, 'bufferViews');
            
            // Step 2: Parse accessors (how to interpret the data)
            const accessors = [];
            if (json.accessors) {
                json.accessors.forEach((accessorDef, index) => {
                    const bufferView = bufferViews[accessorDef.bufferView];
                    accessors[index] = {
                        bufferView: accessorDef.bufferView,
                        byteOffset: accessorDef.byteOffset || 0,
                        componentType: accessorDef.componentType,
                        count: accessorDef.count,
                        type: accessorDef.type,
                        max: accessorDef.max,
                        min: accessorDef.min
                    };
                });
            }
            console.log('Parsed', accessors.length, 'accessors');
            
            // Helper: Component type to TypedArray
            const getTypedArray = (componentType) => {
                switch(componentType) {
                    case 5120: return Int8Array;
                    case 5121: return Uint8Array;
                    case 5122: return Int16Array;
                    case 5123: return Uint16Array;
                    case 5125: return Uint32Array;
                    case 5126: return Float32Array;
                    default: return Float32Array;
                }
            };
            
            // Helper: Type to number of components
            const getTypeSize = (type) => {
                switch(type) {
                    case 'SCALAR': return 1;
                    case 'VEC2': return 2;
                    case 'VEC3': return 3;
                    case 'VEC4': return 4;
                    case 'MAT2': return 4;
                    case 'MAT3': return 9;
                    case 'MAT4': return 16;
                    default: return 1;
                }
            };
            
            // Step 3: Helper to extract accessor data
            const getAccessorData = (accessorIndex) => {
                const accessor = accessors[accessorIndex];
                const bufferView = bufferViews[accessor.bufferView];
                
                const TypedArray = getTypedArray(accessor.componentType);
                const componentSize = TypedArray.BYTES_PER_ELEMENT;
                const typeSize = getTypeSize(accessor.type);
                
                const byteOffset = bufferView.byteOffset + accessor.byteOffset;
                const byteLength = accessor.count * typeSize * componentSize;
                
                // Extract from buffer
                const arrayBuffer = bufferView.buffer;
                const dataView = new TypedArray(arrayBuffer, byteOffset, accessor.count * typeSize);
                
                console.log(`Accessor ${accessorIndex}: ${accessor.type} x ${accessor.count}, ${dataView.length} values`);
                
                return dataView;
            };
            
            // Create nodes
            const nodes = [];
            if (json.nodes) {
                json.nodes.forEach((nodeDef, nodeIndex) => {
                    const node = new THREE.Object3D();
                    node.name = nodeDef.name || 'Node_' + nodeIndex;

                    if (nodeDef.translation) {
                        node.position.fromArray(nodeDef.translation);
                    }
                    if (nodeDef.rotation) {
                        node.quaternion.fromArray(nodeDef.rotation);
                    }
                    if (nodeDef.scale) {
                        node.scale.fromArray(nodeDef.scale);
                    }
                    if (nodeDef.matrix) {
                        node.matrix.fromArray(nodeDef.matrix);
                        node.matrix.decompose(node.position, node.quaternion, node.scale);
                    }
                    
                    // Mark as bone if part of skin
                    if (json.skins) {
                        json.skins.forEach(skin => {
                            if (skin.joints && skin.joints.includes(nodeIndex)) {
                                node.isBone = true;
                            }
                        });
                    }
                    
                    nodes[nodeIndex] = node;
                });

                // Build node hierarchy
                json.nodes.forEach((nodeDef, nodeIndex) => {
                    if (nodeDef.children) {
                        nodeDef.children.forEach(childIndex => {
                            if (nodes[childIndex]) {
                                nodes[nodeIndex].add(nodes[childIndex]);
                            }
                        });
                    }
                });
            }
            
            // Step 4: Create meshes with real geometry
            if (json.meshes && buffers.length > 0) {
                console.log('Creating meshes from', json.meshes.length, 'mesh definitions');
                
                json.meshes.forEach((meshDef, meshIndex) => {
                    meshDef.primitives.forEach((primitive, primIndex) => {
                        console.log(`Building mesh ${meshIndex}, primitive ${primIndex}`);
                        
                        const geometry = new THREE.BufferGeometry();
                        
                        // Step 4a: Add POSITION attribute
                        if (primitive.attributes.POSITION !== undefined) {
                            const positionData = getAccessorData(primitive.attributes.POSITION);
                            geometry.setAttribute('position', new THREE.BufferAttribute(positionData, 3));
                            console.log('  ✓ Added POSITION:', positionData.length / 3, 'vertices');
                        }
                        
                        // Step 4b: Add NORMAL attribute
                        if (primitive.attributes.NORMAL !== undefined) {
                            const normalData = getAccessorData(primitive.attributes.NORMAL);
                            geometry.setAttribute('normal', new THREE.BufferAttribute(normalData, 3));
                            console.log('  ✓ Added NORMAL');
                        }
                        
                        // Step 4c: Add UV coordinates
                        if (primitive.attributes.TEXCOORD_0 !== undefined) {
                            const uvData = getAccessorData(primitive.attributes.TEXCOORD_0);
                            geometry.setAttribute('uv', new THREE.BufferAttribute(uvData, 2));
                            console.log('  ✓ Added UV');
                        }
                        
                        // Step 4c-1: Check for skinning data
                        const isSkinned = (primitive.attributes.JOINTS_0 !== undefined && 
                                          primitive.attributes.WEIGHTS_0 !== undefined);
                        
                        if (isSkinned) {
                            const jointsData = getAccessorData(primitive.attributes.JOINTS_0);
                            const weightsData = getAccessorData(primitive.attributes.WEIGHTS_0);
                            geometry.setAttribute('skinIndex', new THREE.BufferAttribute(jointsData, 4));
                            geometry.setAttribute('skinWeight', new THREE.BufferAttribute(weightsData, 4));
                            console.log('  ✓ Added SKINNING data (rigged mesh)');
                        }
                        
                        // Step 4d: Add indices for faces
                        if (primitive.indices !== undefined) {
                            const indexData = getAccessorData(primitive.indices);
                            geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
                            console.log('  ✓ Added INDICES:', indexData.length / 3, 'triangles');
                        }
                        
                        // Compute bounding sphere for culling
                        geometry.computeBoundingSphere();
                        
                        // Create material
                        const material = new THREE.MeshStandardMaterial({
                            color: 0x8b7355,
                            roughness: 0.7,
                            metalness: 0.1,
                            side: THREE.DoubleSide
                        });
                        
                        // Create mesh (SkinnedMesh if rigged, regular Mesh otherwise)
                        let mesh;
                        if (isSkinned) {
                            mesh = new THREE.SkinnedMesh(geometry, material);
                            console.log('  ✓ Created SkinnedMesh (will bind skeleton later)');
                        } else {
                            mesh = new THREE.Mesh(geometry, material);
                        }
                        mesh.name = meshDef.name || `Mesh_${meshIndex}`;
                        
                        // Find which node references this mesh
                        json.nodes.forEach((nodeDef, nodeIndex) => {
                            if (nodeDef.mesh === meshIndex) {
                                const node = nodes[nodeIndex];
                                // Add mesh as child of the node
                                node.add(mesh);
                                console.log(`  ✓ Attached mesh to node: ${node.name}`);
                            }
                        });
                    });
                });
            }
            
            // Step 5: Process skins and bind skeletons to SkinnedMeshes
            if (json.skins && json.skins.length > 0) {
                console.log('Processing', json.skins.length, 'skin(s)');
                
                json.skins.forEach((skinDef, skinIndex) => {
                    // Collect bone nodes
                    const bones = [];
                    if (skinDef.joints) {
                        skinDef.joints.forEach(jointIndex => {
                            if (nodes[jointIndex]) {
                                bones.push(nodes[jointIndex]);
                            }
                        });
                    }
                    
                    // Create skeleton
                    const skeleton = new THREE.Skeleton(bones);
                    console.log(`  ✓ Created skeleton with ${bones.length} bones`);
                    
                    // Find nodes that use this skin and bind skeleton
                    json.nodes.forEach((nodeDef, nodeIndex) => {
                        if (nodeDef.skin === skinIndex && nodeDef.mesh !== undefined) {
                            const node = nodes[nodeIndex];
                            // Find the SkinnedMesh child
                            node.traverse(child => {
                                if (child.isSkinnedMesh) {
                                    child.bind(skeleton);
                                    console.log(`  ✓ Bound skeleton to ${child.name}`);
                                }
                            });
                        }
                    });
                });
            }
            
            // Build scene
            const scene = new THREE.Group();
            scene.name = 'GLTFScene';
            
            if (json.scenes && json.scenes.length > 0) {
                const sceneData = json.scenes[json.scene || 0];
                if (sceneData.nodes) {
                    sceneData.nodes.forEach(nodeIndex => {
                        if (nodes[nodeIndex]) {
                            scene.add(nodes[nodeIndex]);
                        }
                    });
                }
            }
            
            const result = {
                scene: scene,
                scenes: [scene],
                cameras: [],
                animations: [],
                asset: json.asset || {}
            };
            
            if (onLoad) {
                onLoad(result);
            }
        }
    };

    console.log('✅ GLTFLoader initialized');
    window.GLTFLoader = THREE.GLTFLoader;

})();
