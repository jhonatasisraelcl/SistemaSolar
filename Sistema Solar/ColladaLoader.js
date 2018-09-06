/ **
* @author Tim Knip / http://www.floorplanner.com/ / tim em floorplanner.com
* @author Tony Parisi / http://www.tonyparisi.com/
* /

THREE.ColladaLoader = function () {

	var COLLADA = nulo;
	var scene = null;
	var visualScene;
	var kinematicsModel;

	var readyCallbackFunc = nulo;

	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	efeitos de var = {};
	var cameras = {};
	var lights = {};

	var animData;
	var cinemática;
	var visualScenes;
	var kinematicsModels;
	var baseUrl;
	var morfos;
	peles var;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Força a geometria a estar sempre centrada na origem local do
		// contendo Mesh.
		centerGeometry: false,

		// A conversão do eixo é feita para geometrias, animações e controladores.
		// Se alguma vez retirarmos as câmeras ou luzes do arquivo COLLADA, elas
		// precisa de trabalho extra.
		convertUpAxis: false,

		subdivideFaces: true

		upAxis: 'Y'

		// Para materiais refletivos ou refrativos, usaremos este cubemap
		defaultEnvMap: null

	};

	var colladaUnit = 1,0;
	var colladaUp = 'Y';
	var upConversion = nulo;

	função load (url, readyCallback, progressCallback, failCallback) {

		var length = 0;

		if (document.implementation && document.implementation.createDocument) {

			var request = new XMLHttpRequest ();

			request.onreadystatechange = function () {

				if (request.readyState === 4) {

					if (request.status === 0 || request.status === 200) {

						if (request.response) {

							readyCallbackFunc = readyCallback;
							parse (request.response, indefinido, url);

						} outro {

							if (failCallback) {

								failCallback ({tipo: 'erro', url: url});

							} outro {

								console.error ("ColladaLoader: Arquivo vazio ou inexistente (" + url + ")");

							}

						}

					}outro{

						if (failCallback) {

							failCallback ({tipo: 'erro', url: url});

						}outro{

							console.error ('ColladaLoader: Não foi possível carregar' '+ url +' "('+ request.status +') ');

						}

					}

				} else if (request.readyState === 3) {

					if (progressCallback) {

						if (comprimento === 0) {

							length = request.getResponseHeader ("Content-Length");

						}

						progressCallback ({total: length, loaded: request.responseText.length});

					}

				}

			};

			request.open ("GET", url, true);
			request.send (null);

		} outro {

			alert ("Não sei como analisar XML!");

		}

	}

	função parse (text, callBack, url) {

		COLLADA = new DOMParser (). ParseFromString (texto, 'text / xml');
		callBack = callBack || readyCallbackFunc;

		if (url! == indefinido) {

			var parts = url.split ('/');
			parts.pop ();
			baseUrl = (parts.length <1? '.': parts.join ('/')) + '/';

		}

		parseAsset ();
		setUpConversion ();
		images = parseLib ("library_images image", _Image, "image");
		materiais = parseLib ("material da biblioteca_material", Material, "material");
		efeitos = parseLib ("efeito de biblioteca_effects", efeito, "efeito");
		geometries = parseLib ("geometria de library_geometries", Geometria, "geometria");
		cameras = parseLib ("library_cameras camera", Camera, "camera");
		lights = parseLib ("library_lights light", luz, "luz");
		controllers = parseLib ("library_controllers controller", Controller, "controller");
		animations = parseLib ("library_animations animation", animação, "animação");
		visualScenes = parseLib ("library_visual_scenes visual_scene", VisualScene, "visual_scene");
		kinematicsModels = parseLib ("library_kinematics_models kinematics_model", KinematicsModel, "kinematics_model");

		morfos = [];
		peles = [];

		visualScene = parseScene ();
		scene = new THREE.Group ();

		para (var i = 0; i <visualScene.nodes.length; i ++) {

			scene.add (createSceneGraph (visualScene.nodes [i]));

		}

		// conversão de unidades
		scene.scale.multiplyScalar (colladaUnit);

		createAnimations ();

		kinematicsModel = parseKinematicsModel ();
		createKinematics ();

		var result = {

			cena: cena,
			morfos: morfos,
			peles: peles,
			animações: animData,
			cinemática: cinemática,
			dae: {
				imagens: imagens,
				materiais: materiais,
				câmeras: câmeras,
				luzes: luzes,
				efeitos: efeitos,
				geometrias: geometrias,
				controladores: controladores,
				animações: animações,
				visualScenes: visualScenes,
				VisualScene: VisualScene,
				cena: visualscene,
				CinemáticaModelos: CinemáticaModelos,
				kinematicsModel: kinematicsModel
			}

		};

		if (callBack) {

			callBack (resultado);

		}

		resultado de retorno;

	}

	function setPreferredShading (sombreamento) {

		preferredShading = sombreamento;

	}

	função parseAsset () {

		var elements = COLLADA.querySelectorAll ('asset');

		var element = elementos [0];

		if (element && element.childNodes) {

			para (var i = 0; i <element.childNodes.length; i ++) {

				var child = element.childNodes [i];

				switch (child.nodeName) {

					case 'unit':

						var meter = child.getAttribute ('metro');

						if (metro) {

							colladaUnit = parseFloat (metro);

						}

						pausa;

					case 'up_axis':

						colladaUp = child.textContent.charAt (0);
						pausa;

				}

			}

		}

	}

	function parseLib (q, classSpec, prefixo) {

		var elements = COLLADA.querySelectorAll (q);

		var lib = {};

		var i = 0;

		var elementsLength = elements.length;

		para (var j = 0; j <elementsLength; j ++) {

			var element = elementos [j];
			var daeElement = (new classSpec ()) .parse (elemento);

			if (! daeElement.id || daeElement.id.length === 0) daeElement.id = prefixo + (i ++);
			lib [daeElement.id] = daeElement;

		}

		return lib;

	}

	função parseScene () {

		var sceneElement = COLLADA.querySelectorAll ('scene instance_visual_scene') [0];

		if (sceneElement) {

			var url = sceneElement.getAttribute ('url') .replace (/ ^ # /, '');
			retornar visualScenes [url.length> 0? url: 'visual_scene0'];

		} outro {

			return null;

		}

	}

	function parseKinematicsModel () {

		var kinematicsModelElement = COLLADA.querySelectorAll ('instance_kinematics_model') [0];

		if (kinematicsModelElement) {

			var url = kinematicsModelElement.getAttribute ('url') .replace (/ ^ # /, '');
			return kinematicsModels [url.length> 0? url: 'kinematics_model0'];

		} outro {

			return null;

		}

	}

	function createAnimations () {

		animData = [];

		// preencha as chaves
		recurseHierarchy (cena);

	}

	função recurseHierarchy (node) {

		var n = visualScene.getChildById (node.colladaId, true),
			newData = null;

		if (n && n.keys) {

			newData = {
				fps: 60,
				hierarquia: [ {
					nó: n,
					chaves: n.keys,
					sids: n.sids
				}],
				nó: nó
				nome: 'animation_' + node.name,
				comprimento: 0
			};

			animData.push (newData);

			para (var i = 0, il = n.keys.length; i <i; i ++) {

				newData.length = Math.max (newData.length, n.keys [i] .time);

			}

		} outro {

			newData = {
				hierarquia: [ {
					chaves: [],
					sids: []
				}]
			}

		}

		para (var i = 0, il = node.children.length; i <i; i ++) {

			var d = recurseHierarchy (node.children [i]);

			para (var j = 0, jl = d.hierarchy.length; j <jl; j ++) {

				newData.hierarchy.push ({
					chaves: [],
					sids: []
				});

			}

		}

		return newData;

	}

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;
		var ID;
		para (var id em animações) {

			var animação = animações [id];
			ID = ID || animation.id;
			para (var i = 0; i <animação.sampler.length; i ++) {

				var sampler = animation.sampler [i];

				sampler.create ();

				start = Math.min (iniciar, sampler.startTime);
				end = Math.max (end, sampler.endTime);
				quadros = Math.max (frames, sampler.input.length);

			}

		}

		return {start: início, fim: fim, frames: frames, ID: ID};

	}

	função createMorph (geometry, ctrl) {

		var morphCtrl = ctrl instanceof InstanceController? controladores [ctrl.url]: ctrl;

		if (! morphCtrl ||! morphCtrl.morph) {

			console.log ("não foi possível encontrar o controlador de metamorfose!");
			Retorna;

		}

		var morf = morfctrl.morph;

		para (var i = 0; i <morf.targets.length; i ++) {

			var target_id = morph.targets [i];
			var daeGeometry = geometrias [target_id];

			if (! daeGeometry.mesh ||
				 ! daeGeometry.mesh.primitives ||
				 ! daeGeometry.mesh.primitives.length) {
				 continuar;
			}

			var target = daeGeometry.mesh.primitives [0] .geometry;

			if (target.vertices.length === geometry.vertices.length) {

				geometry.morphTargets.push ({name: "target_1", vértices: target.vertices});

			}

		}

		geometry.morphTargets.push ({name: "target_Z", vértices: geometry.vertices});

	}

	função createSkin (geometry, ctrl, applyBindShape) {

		var skinCtrl = controllers [ctrl.url];

		if (! skinCtrl ||! skinCtrl.skin) {

			console.log ("não foi possível encontrar o controlador de skin!");
			Retorna;

		}

		if (! ctrl.skeleton ||! ctrl.skeleton.length) {

			console.log ("não foi possível encontrar o esqueleto para a pele!");
			Retorna;

		}

		var skin = skinCtrl.skin;
		var skeleton = visualScene.getChildById (ctrl.skeleton [0]);
		hierarquia var = [];

		applyBindShape = applyBindShape! == indefinido? applyBindShape: true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		// createBones (geometry.bones, skin, hierarchy, skeleton, null, -1);
		// createWeights (skin, geometry.bones, geometry.skinIndices, geometry.skinWeights);

		/ *
		geometry.animation = {
			nome: 'take_001',
			fps: 30,
			comprimento: 2,
			JIT: verdade
			hierarquia: hierarquia
		};
		* /

		if (applyBindShape) {

			para (var i = 0; i <geometry.vertices.length; i ++) {

				geometry.vertices [i] .applyMatrix4 (skin.bindShapeMatrix);

			}

		}

	}

	função setupSkeleton (nó, bones, frame, parent) {

		node.world = node.world || novo THREE.Matrix4 ();
		node.localworld = node.localworld || novo THREE.Matrix4 ();
		node.world.copy (node.matrix);
		node.localworld.copy (node.matrix);

		if (node.channels && node.channels.length) {

			var channel = node.channels [0];
			var m = channel.sampler.output [frame];

			if (m instanceof THREE.Matrix4) {

				node.world.copy (m);
				node.localworld.copy (m);
				if (quadro === 0)
					node.matrix.copy (m);
			}

		}

		if (pai) {

			node.world.multiplyMatrices (pai, nó.world);

		}

		bones.push (nó);

		para (var i = 0; i <nó.nodes.length; i ++) {

			setupSkeleton (node.nodes [i], ossos, frame, node.world);

		}

	}

	function setupSkinningMatrices (bones, skin) {

		// FIXME: isso é burro ...

		para (var i = 0; i <bones.length; i ++) {

			var bone = ossos [i];
			var encontrado = -1;

			if (bone.type! = 'JOINT') continua;

			para (var j = 0; j <skin.joints.length; j ++) {

				if (bone.sid === skin.joints [j]) {

					encontrado = j;
					pausa;

				}

			}

			if (encontrado> = 0) {

				var inv = skin.invBindMatrices [encontrado];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4 ();
				bone.skinningMatrix.multiplyMatrices (bone.world, inv); // (IBMi * JMi)
				bone.animatrix = new THREE.Matrix4 ();

				bone.animatrix.copy (bone.localworld);
				bone.weights = [];

				para (var j = 0; j <skin.weights.length; j ++) {

					para (var k = 0; k <skin.weights [j]. comprimento; k ++) {

						var w = skin.weights [j] [k];

						if (w.joint === encontrado) {

							bone.weights.push (w);

						}

					}

				}

			} outro {

				console.warn ("ColladaLoader: Não foi possível encontrar a junção '" + bone.sid + "'.");

				bone.skinningMatrix = new THREE.Matrix4 ();
				bone.weights = [];

			}
		}

	}

	// Ande na árvore Collada e alise os ossos em uma lista, extraia a posição, quat e escala da matriz
	função flattenSkeleton (esqueleto) {

		var list = [];
		var walk = function (parentid, node, list) {

			var bone = {};
			bone.name = node.sid;
			osso.parente = parente;
			bone.matrix = node.matrix;
			var data = [novo THREE.Vector3 (), novo THREE.Quaternion (), novo THREE.Vector3 ()];
			bone.matrix.decompose (dados [0], dados [1], dados [2]);

			bone.pos = [dados [0] .x, dados [0] .y, dados [0] .z];

			bone.scl = [dados [2] .x, dados [2] .y, dados [2] .z];
			bone.rotq = [dados [1] .x, dados [1] .y, dados [1] .z, dados [1] .w];
			list.push (osso);

			para (var i em node.nodes) {

				andar (node.sid, node.nodes [i], lista);

			}

		};

		andar (-1, esqueleto, lista);
		lista de retorno;

	}

	// Mova os vértices para a pose apropriada para o início da animação
	function skinToBindPose (geometria, esqueleto, skinController) {

		var bones = [];
		setupSkeleton (esqueleto, ossos, -1);
		setupSkinningMatrices (bones, skinController.skin);
		var v = new THREE.Vector3 ();
		var skinned = [];

		para (var i = 0; i <geometry.vertices.length; i ++) {

			skinned.push (novo THREE.Vector3 ());

		}

		para (i = 0; i <bones.length; i ++) {

			if (bones [i] .type! = 'JOINT') continua;

			para (var j = 0; j <ossos [i] .weights.length; j ++) {

				var w = bones [i] .weights [j];
				var vidx = w.index;
				var peso = w peso;

				var o = geometry.vertices [vidx];
				var s = skinned [vidx];

				vx = boi;
				vy = oy;
				vz = oz;

				v.applyMatrix4 (bones [i] .skinningMatrix);

				sx + = (peso vx *);
				sy + = (peso vy *);
				sz + = (peso vz *);
			}

		}

		para (var i = 0; i <geometry.vertices.length; i ++) {

			geometry.vertices [i] = esfolado [i];

		}

	}

	função applySkin (geometry, instanceCtrl, frame) {

		var skinController = controllers [instanceCtrl.url];

		frame = frame! == indefinido? quadro: 40;

		if (! skinController ||! skinController.skin) {

			console.log ('ColladaLoader: Não foi possível encontrar o controlador de skin.');
			Retorna;

		}

		if (! instanceCtrl.skeleton ||! instanceCtrl.skeleton.length) {

			console.log ('ColladaLoader: Não foi possível encontrar o esqueleto da skin.');
			Retorna;

		}

		var animationBounds = calcAnimationBounds ();
		var skeleton = visualScene.getChildById (instanceCtrl.skeleton [0], true) || visualScene.getChildBySid (instanceCtrl.skeleton [0], true);

		// achatar o esqueleto em uma lista de ossos
		var bonelist = flattenSkeleton (esqueleto);
		var joints = skinController.skin.joints;

		// classifica essa lista para que a ordem reflita o pedido na lista conjunta
		var sortedbones = [];
		para (var i = 0; i <joints.length; i ++) {

			para (var j = 0; j <bonelist.length; j ++) {

				if (bonelist [j] .name === juntas [i]) {

					Selas classificadas [i] = bonelist [j];

				}

			}

		}

		// ligar os pais por índice em vez de nome
		para (var i = 0; i <sortedbones.length; i ++) {

			para (var j = 0; j <sortedbones.length; j ++) {

				if (sortedbones [i] .parent === sortedbones [j] .name) {

					sortedbones [i] .parent = j;

				}

			}

		}


		var i, j, w, vidx, peso;
		var v = new THREE.Vector3 (), o, s;

		// move os vértices para vincular a forma
		para (i = 0; i <geometry.vertices.length; i ++) {
			geometry.vertices [i] .applyMatrix4 (skinController.skin.bindShapeMatrix);
		}

		var skinIndices = [];
		var skinWeights = [];
		var pesos = skinController.skin.weights;

		// ligar os pesos da pele
		// TODO - este pode ser um bom lugar para escolher os maiores 4 pesos
		para (var i = 0; i <pesos.length; i ++) {

			var indicies = new THREE.Vector4 (pesos [i] [0]? pesos [i] [0] .joint: 0, pesos [i] [1]? pesos [i] [1] .joint: 0, pesos [ i] [2]? pesos [i] [2] .oint: 0, pesos [i] [3]? pesos [i] [3] .oint: 0);
			var weight = new THREE.Vector4 (pesos [i] [0]? pesos [i] [0] .peso: 0, pesos [i] [1]? pesos [i] [1] .peso: 0, pesos [ i] [2]? pesos [i] [2] .peso: 0, pesos [i] [3]? pesos [i] [3] .peso: 0);

			skinIndices.push (indicações);
			skinWeights.push (peso);

		}

		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = sortedbones;
		// processa animação, ou simplesmente coloca o rig se não houver animação

		// cria uma animação para os ossos animados
		// NOTA: isso não tem efeito ao usar morftargets
		var animationdata = {"nome": animationBounds.ID, "fps": 30, "comprimento": animationBounds.frames / 30, "hierarquia": []};

		para (var j = 0; j <sortedbones.length; j ++) {

			animationdata.hierarchy.push ({parent: sortedbones [j] .parent, nome: sortedbones [j] .name, chaves: []});

		}

		console.log ('ColladaLoader:', animationBounds.ID + 'tem' + sortedbones.length + 'bones.');



		skinToBindPose (geometria, esqueleto, skinController);


		para (frame = 0; frame <animationBounds.frames; frame ++) {

			var bones = [];
			var skinned = [];
			// processa o quadro e configura o equipamento com um novo
			// transformar, possivelmente do (s) canal (is) de animação do bone

			setupSkeleton (esqueleto, ossos, quadro);
			setupSkinningMatrices (bones, skinController.skin);

			para (var i = 0; i <bones.length; i ++) {

				para (var j = 0; j <animationdata.hierarchy.length; j ++) {

					if (animationdata.hierarchy [j] .name === ossos [i] .sid) {

						var key = {};
						key.time = (frame / 30);
						key.matrix = ossos [i] .animatrix;

						if (quadro === 0)
							bones [i] .matrix = key.matrix;

						var data = [novo THREE.Vector3 (), novo THREE.Quaternion (), novo THREE.Vector3 ()];
						key.matrix.decompose (dados [0], dados [1], dados [2]);

						key.pos = [dados [0] .x, dados [0] .y, dados [0] .z];

						key.scl = [dados [2] .x, dados [2] .y, dados [2] .z];
						key.rot = data [1];

						animationdata.hierarchy [j] .keys.push (chave);

					}

				}

			}

			geometry.animation = animationdata;

		}

	}

	function createKinematics () {

		if (kinematicsModel && kinematicsModel.joints.length === 0) {
			cinemática = indefinida;
			Retorna;
		}

		var jointMap = {};

		var _addToMap = function (jointIndex, parentVisualElement) {

			var parentVisualElementId = parentVisualElement.getAttribute ('id');
			var colladaNode = visualScene.getChildById (parentVisualElementId, true);
			var joint = kinematicsModel.joints [jointIndex];

			scene.traverse (function (node) {

				if (node.colladaId == parentVisualElementId) {

					jointMap [jointIndex] = {
						nó: nó
						transforma: colladaNode.transforms,
						articulação: conjunta,
						posição: joint.zeroPosition
					};

				}

			});

		};

		cinemática = {

			articulações: kinematicsModel && kinematicsModel.joints,

			getJointValue: function (jointIndex) {

				var jointData = jointMap [jointIndex];

				if (jointData) {

					return jointData.position;

				} outro {

					console.log ('getJointValue: joint' + jointIndex + 'não existe');

				}

			}

			setJointValue: function (jointIndex, value) {

				var jointData = jointMap [jointIndex];

				if (jointData) {

					var joint = jointData.joint;

					if (valor> joint.limits.max || valor <joint.limits.min) {

						console.log ('setJointValue: joint' + jointIndex + 'valor' + valor + 'fora dos limites (min:' + joint.limits.min + ', max:' + joint.limits.max + ')');

					} else if (joint.static) {

						console.log ('setJointValue: joint' + jointIndex + 'é estático');

					} outro {

						var threejsNode = jointData.node;
						var axis = joint.axis;
						var transformforms = jointData.transforms;

						var matrix = new THREE.Matrix4 ();

						para (i = 0; i <transforms.length; i ++) {

							var transform = transforma [i];

							// tipo de deteção articular do gueto
							if (transform.sid && transform.sid.indexOf ('joint' + jointIndex) == -1) {

								// aplica o valor real da junção aqui
								switch (joint.type) {

									caso 'revolute':

										matrix.multiply (m1.makeRotationAxis (eixo, THREE.Math.degToRad (valor)));
										pausa;

									caso 'prismático':

										matrix.multiply (m1.makeTranslation (valor de axis.x *, valor de axis.y *, valor de axis.z *));
										pausa;

									padrão:

										console.warn ('setJointValue: tipo de junção desconhecido:' + joint.type);
										pausa;

								}

							} outro {

								var m1 = new THREE.Matrix4 ();

								switch (transform.type) {

									case 'matrix':

										matrix.multiply (transform.obj);

										pausa;

									case 'translate':

										matrix.multiply (m1.makeTranslation (transform.obj.x, transform.obj.y, transform.obj.z));

										pausa;

									case 'rotate':

										matrix.multiply (m1.makeRotationAxis (transform.obj, transform.angle));

										pausa;

								}
							}
						}

						// aplica a matriz ao nó threejs
						var elementsFloat32Arr = matrix.elements;
						var elements = Array.prototype.slice.call (elementsFloat32Arr);

						var elementsRowMajor = [
							elementos [0],
							elementos [4],
							elementos [8],
							elementos [12],
							elementos [1],
							elementos [5],
							elementos [9],
							elementos [13],
							elementos [2],
							elementos [6],
							elementos [10],
							elementos [14],
							elementos [3],
							elementos [7],
							elementos [11],
							elementos [15]
						];

						threejsNode.matrix.set.apply (threejsNode.matrix, elementsRowMajor);
						threejsNode.matrix.decompose (threejsNode.position, threejsNode.quaternion, threejsNode.scale);
					}

				} outro {

					console.log ('setJointValue: joint' + jointIndex + 'não existe');

				}

			}

		};

		var element = COLLADA.querySelector ('scene instance_kinematics_scene');

		if (element) {

			para (var i = 0; i <element.childNodes.length; i ++) {

				var child = element.childNodes [i];

				if (child.nodeType! = 1) continua;

				switch (child.nodeName) {

					case 'bind_joint_axis':

						var visualTarget = child.getAttribute ('target') .split ('/') .pop ();
						var axis = child.querySelector ('axis param'). textContent;
						var jointIndex = parseInt (axis.split ('conjunto') .pop (). split ('.') [0]);
						var visualTargetElement = COLLADA.querySelector ('[sid = "' + visualTarget + '"]');

						if (visualTargetElement) {
							var parentVisualElement = visualTargetElement.parentElement;
							_addToMap (jointIndex, parentVisualElement);
						}

						pausa;

					padrão:

						pausa;

				}

			}
		}

	}

	function createSceneGraph (nó, pai) {

		var obj = novo THREE.Object3D ();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		para (i = 0; i <node.controllers.length; i ++) {

			var controller = controllers [node.controllers [i] .url];

			switch (controller.type) {

				case 'skin':

					if (geometrias [controller.skin.source]) {

						var inst_geom = new InstanceGeometry ();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers [i] .instance_material;

						node.geometries.push (inst_geom);
						esfolado = verdadeiro;
						skinController = node.controllers [i];

					} else if (controllers [controller.skin.source]) {

						// urgh: o controlador pode ser acorrentado
						// lida com o caso mais básico ...

						var second = controllers [controller.skin.source];
						morphController = segundo;
					// skinController = node.controllers [i];

						if (second.morph && geometries [second.morph.source]) {

							var inst_geom = new InstanceGeometry ();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers [i] .instance_material;

							node.geometries.push (inst_geom);

						}

					}

					pausa;

				case 'morph':

					if (geometrias [controller.morph.source]) {

						var inst_geom = new InstanceGeometry ();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers [i] .instance_material;

						node.geometries.push (inst_geom);
						morphController = node.controllers [i];

					}

					console.log ('ColladaLoader: Morph-controller parcialmente suportado.');

				padrão:
					pausa;

			}

		}

		// geometrias

		var double_sided_materials = {};

		para (i = 0; i <node.geometries.length; i ++) {

			var instance_geometry = node.geometries [i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries [instance_geometry.url];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if (geometria) {

				if (! geometry.mesh ||! geometry.mesh.primitives)
					continuar;

				if (obj.name.length === 0) {

					obj.name = geometry.id;

				}

				// coleta o fx usado para essa instância de geometria

				if (instance_materials) {

					para (j = 0; j <instance_materials.length; j ++) {

						var instance_material = instance_materials [j];
						var mat = materials [instance_material.target];
						var effect_id = mat.instance_effect.url;
						var shader = efeitos [effect_id] .shader;
						var material3js = shader.material;

						if (geometry.doubleSided) {

							if (! (instance_material.symbol in double_sided_materials)) {

								var _copied_material = material3js.clone ();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials [instance_material.symbol] = _copied_material;

							}

							material3js = double_sided_materials [instance_material.symbol];

						}

						material3js.opacity =! material3js.opacity? 1: material3js.opacity;
						used_materials [instance_material.symbol] = num_materials;
						used_materials_array.push (material3js);
						first_material = material3js;
						first_material.name = mat.name === null || mat.name === ''? mat.id: mat.name;
						num_materials ++;

					}

				}

				malha var;
				var material = first_material || new THREE.MeshLambertMaterial ({color: 0xdddddd, lado: geometry.doubleSided? THREE.DoubleSide: THREE.FrontSide});
				var geom = geometry.mesh.geometry3js;

				if (num_materials> 1) {

					material = novo THREE.MultiMaterial (used_materials_array);
					
					para (j = 0; j <geom.faces.length; j ++) {

						var face = geom.faces [j];
						face.materialIndex = used_materials [face.daeMaterial]

					}

				}

				if (skinController! == undefined) {


					applySkin (geom, skinController);

					if (geom.morphTargets.length> 0) {

						material.morphTargets = true;
						material.skinning = false;

					} outro {

						material.morphTargets = false;
						material.skinning = true;

					}


					malha = new THREE.SkinnedMesh (geom, material, falso);


					//mesh.skeleton = skinController.skeleton;
					//mesh.skinController = controllers [skinController.url];
					//mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;



					//mesh.animationHandle.setKey(0);
					skins.push (malha);

				} else if (morphController! == undefined) {

					createMorph (geom, morphController);

					material.morphTargets = true;

					malha = new THREE.Mesh (geom, material);
					mesh.name = 'morph_' + morphs.length;

					morphs.push (malha);

				} outro {

					if (geom.isLineStrip === true) {

						malha = new THREE.Line (geom);

					} outro {

						malha = new THREE.Mesh (geom, material);

					}

				}

				obj.add (malha);

			}

		}

		para (i = 0; i <node.cameras.length; i ++) {

			var instance_camera = node.cameras [i];
			var cparams = cameras [instance_camera.url];

			var cam = new THREE.PerspectiveCamera (cparams.yfov, parseFloat (cparams.aspect_ratio),
					parseFloat (cparams.znear), parseFloat (cparams.zfar));

			obj.add (cam);
		}

		para (i = 0; i <node.lights.length; i ++) {

			var light = null;
			var instance_light = node.lights [i];
			var lparams = luzes [instance_light.url];

			if (lparams && lparams.technique) {

				var color = lparams.color.getHex ();
				var intensidade = lparams.intensidade;
				var distance = lparams.distance;
				var angle = lparams.falloff_angle;

				switch (lparams.technique) {

					case 'direcional':

						light = new THREE.DirectionalLight (cor, intensidade, distância);
						light.position.set (0, 0, 1);
						pausa;

					caso 'ponto':

						light = new THREE.PointLight (cor, intensidade, distância);
						pausa;

					case 'spot':

						light = new THREE.SpotLight (cor, intensidade, distância, ângulo);
						light.position.set (0, 0, 1);
						pausa;

					case 'ambient':

						light = new THREE.AmbientLight (cor);
						pausa;

				}

			}

			if (light) {
				obj.add (luz);
			}
		}

		obj.name = node.name || node.id || "";
		obj.colladaId = node.id || "";
		obj.layer = node.layer || "";
		obj.matrix = node.matrix;
		obj.matrix.decompose (obj.position, obj.quaternion, obj.scale);

		if (options.centerGeometry && obj.geometry) {

			var delta = obj.geometry.center ();
			delta.multiply (obj.scale);
			delta.applyQuaternion (obj.quaternion);

			obj.position.sub (delta);

		}

		para (i = 0; i <node.nodes.length; i ++) {

			obj.add (createSceneGraph (node.nodes [i], nó));

		}

		return obj;

	}

	function getJointId (skin, id) {

		para (var i = 0; i <skin.joints.length; i ++) {

			if (skin.joints [i] === id) {

				return i;

			}

		}

	}

	function getLibraryNode (id) {

		var nodes = COLLADA.querySelectorAll ('nó library_nodes');

		para (var i = 0; i <nós.length; i ++) {

			var attObj = nós [i] .attributes.getNamedItem ('id');

			if (attObj && attObj.value === id) {

				nós de retorno [i];

			}

		}

		retornar indefinido;

	}

	function getChannelsForNode (node) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		para (var id em animações) {

			var animação = animações [id];

			para (var i = 0; i <animação.channel.length; i ++) {

				var channel = animation.channel [i];
				var sampler = animation.sampler [i];
				var id = channel.target.split ('/') [0];

				if (id == node.id) {

					sampler.create ();
					channel.sampler = sampler;
					startTime = Math.min (startTime, sampler.startTime);
					endTime = Math.max (endTime, sampler.endTime);
					channels.push (canal);

				}

			}

		}

		if (channels.length) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		canais de retorno;

	}

	function calcFrameDuration (node) {

		var minT = 10000000;

		para (var i = 0; i <node.channels.length; i ++) {

			var sampler = node.channels [i]. sampler;

			para (var j = 0; j <sampler.input.length - 1; j ++) {

				var t0 = sampler.input [j];
				var t1 = sampler.input [j + 1];
				minT = Math.min (minT, t1 - t0);

			}
		}

		return minT;

	}

	função calcMatrixAt (node, t) {

		var animado = {};

		var i, j;

		para (i = 0; i <node.channels.length; i ++) {

			var channel = node.channels [i];
			animated [channel.sid] = canal;

		}

		var matrix = new THREE.Matrix4 ();

		para (i = 0; i <node.transforms.length; i ++) {

			var transform = node.transforms [i];
			var channel = animado [transform.sid];

			if (canal! == indefinido) {

				var sampler = channel.sampler;
				valor var;

				para (j = 0; j <sampler.input.length - 1; j ++) {

					if (sampler.input [j + 1]> t) {

						value = sampler.output [j];
						//console.log (value.flatten)
						pausa;

					}

				}

				if (valor! == indefinido) {

					if (instância do valor de THREE.Matrix4) {

						matrix.multiplyMatrices (matriz, valor);

					} outro {

						// FIXME: manipula outros tipos

						matrix.multiplyMatrices (matrix, transform.matrix);

					}

				} outro {

					matrix.multiplyMatrices (matrix, transform.matrix);

				}

			} outro {

				matrix.multiplyMatrices (matrix, transform.matrix);

			}

		}

		matriz de retorno;

	}

	function bakeAnimations (node) {

		if (node.channels && node.channels.length) {

			var keys = [],
				sids = [];

			para (var i = 0, il = nó.channels.length; i <i; i ++) {

				var channel = node.channels [i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid (channel.sid),
					membro;

				if (channel.arrIndices) {

					member = [];

					para (var j = 0, jl = canal.arrIndices.length; j <jl; j ++) {

						member [j] = getConvertedIndex (channel.arrIndices [j]);

					}

				} outro {

					member = getConvertedMember (channel.member);

				}

				if (transform) {

					if (sids.indexOf (fullSid) === -1) {

						sids.push (fullSid);

					}

					para (var j = 0, jl = entrada.length; j <jl; j ++) {

						var time = input [j]
							data = sampler.getData (transform.type, j, membro),
							key = findKey (chaves, hora);

						if (! chave) {

							key = new Key (tempo);
							var timeNdx = findTimeNdx (chaves, hora);
							keys.splice (timeNdx === -1? keys.length: timeNdx, 0, chave);

						}

						key.addTarget (fullSid, ​​transform, member, data);

					}

				} outro {

					console.log ('Não foi possível encontrar a transformação' '+ channel.sid +' "no nó '+ node.id);

				}

			}

			// pós-processo
			para (var i = 0; i <sids.length; i ++) {

				var sid = sids [i];

				para (var j = 0; j <keys.length; j ++) {

					var key = chaves [j];

					if (! key.hasTarget (sid)) {

						interpolateKeys (keys, key, j, sid);

					}

				}

			}

			node.keys = chaves;
			node.sids = sids;

		}

	}

	function findKey (chaves, hora) {

		var retVal = null;

		para (var i = 0, il = chaves.length; i <il && retVal === null; i ++) {

			var key = chaves [i];

			if (key.time === time) {

				retVal = key;

			} else if (key.time> time) {

				pausa;

			}

		}

		return retVal;

	}

	function findTimeNdx (chaves, tempo) {

		var ndx = -1;

		para (var i = 0, il = chaves.length; i <il && ndx === -1; i ++) {

			var key = chaves [i];

			if (key.time> = tempo) {

				ndx = i;

			}

		}

		return ndx;

	}

	função interpolateKeys (chaves, chave, ndx, fullSid) {

		var prevKey = getPrevKeyWith (chaves, fullSid, ​​ndx? ndx - 1: 0),
			nextKey = getNextKeyWith (chaves, fullSid, ​​ndx + 1);

		if (prevKey && nextKey) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget (fullSid),
				nextData = nextKey.getTarget (fullSid) .data,
				prevData = prevTarget.data,
				dados;

			if (prevTarget.type === 'matrix') {

				data = prevData;

			} else if (prevData.length) {

				data = [];

				para (var i = 0; i <prevData.length; ++ i) {

					dados [i] = prevData [i] + (nextData [i] - prevData [i]) * escala;

				}

			} outro {

				data = prevData + (nextData - prevData) * escala;

			}

			key.addTarget (fullSid, ​​prevTarget.transform, prevTarget.member, data);

		}

	}

	// Obtém a próxima chave com o sid dado

	função getNextKeyWith (keys, fullSid, ​​ndx) {

		for (; ndx <keys.length; ndx ++) {

			var key = chaves [ndx];

			if (key.hasTarget (fullSid)) {

				chave de retorno;

			}

		}

		return null;

	}

	// Obtém a chave anterior com o sid dado

	function getPrevKeyWith (chaves, fullSid, ​​ndx) {

		ndx = ndx> = 0? ndx: ndx + keys.length;

		para (; ndx> = 0; ndx -) {

			var key = chaves [ndx];

			if (key.hasTarget (fullSid)) {

				chave de retorno;

			}

		}

		return null;

	}

	função _Image () {

		this.id = "";
		this.init_from = "";

	}

	_Image.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			if (child.nodeName === 'init_from') {

				this.init_from = child.textContent;

			}

		}

		devolva isto;

	};

	function Controller () {

		this.id = "";
		this.name = "";
		this.type = "";
		isto.skin = nulo;
		this.morph = null;

	}

	Controller.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');
		this.type = "none";

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				case 'skin':

					this.skin = (new Skin ()). parse (filho);
					this.type = child.nodeName;
					pausa;

				case 'morph':

					this.morph = (new Morph ()). parse (filho);
					this.type = child.nodeName;
					pausa;

				padrão:
					pausa;

			}
		}

		devolva isto;

	};

	função Morph () {

		this.method = null;
		this.source = nulo;
		this.targets = nulo;
		this.weights = nulo;

	}

	Morph.prototype.parse = function (element) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute ('método');
		this.source = element.getAttribute ('source') .replace (/ ^ # /, '');

		para (i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'source':

					var source = (new Source ()) .parse (filho);
					fontes [source.id] = fonte;
					pausa;

				caso 'alvos':

					inputs = this.parseInputs (filho);
					pausa;

				padrão:

					console.log (child.nodeName);
					pausa;

			}

		}

		para (i = 0; i <inputs.length; i ++) {

			var input = inputs [i];
			var source = sources [input.source];

			switch (input.semantic) {

				case 'MORPH_TARGET':

					this.targets = source.read ();
					pausa;

				caso 'MORPH_WEIGHT':

					this.weights = source.read ();
					pausa;

				padrão:
					pausa;

			}
		}

		devolva isto;

	};

	Morph.prototype.parseInputs = function (element) {

		var inputs = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				caso 'entrada':

					inputs.push ((new Input ()). parse (child));
					pausa;

				padrão:
					pausa;
			}
		}

		devolver entradas;

	};

	function Skin () {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	}

	Skin.prototype.parse = function (element) {

		var sources = {};
		var juntas, pesos;

		this.source = element.getAttribute ('source') .replace (/ ^ # /, '');
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'bind_shape_matrix':

					var f = _floats (child.textContent);
					this.bindShapeMatrix = getConvertedMat4 (f);
					pausa;

				case 'source':

					var src = new Source (). parse (filho);
					fontes [src.id] = src;
					pausa;

				case 'joints':

					articulações = criança;
					pausa;

				case 'vertex_weights':

					pesos = criança;
					pausa;

				padrão:

					console.log (child.nodeName);
					pausa;

			}
		}

		this.parseJoints (juntas, fontes);
		this.parseWeights (pesos, fontes);

		devolva isto;

	};

	Skin.prototype.parseJoints = function (element, sources) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				caso 'entrada':

					var input = (new Input ()) .parse (filho);
					var source = sources [input.source];

					if (input.semantic === 'JOINT') {

						this.joints = source.read ();

					} else if (input.semantic === 'INV_BIND_MATRIX') {

						this.invBindMatrices = source.read ();

					}

					pausa;

				padrão:
					pausa;
			}

		}

	};

	Skin.prototype.parseWeights = function (element, sources) {

		var v, vcount, inputs = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				caso 'entrada':

					inputs.push ((new Input ()) .parse (child));
					pausa;

				case 'v':

					v = _ints (child.textContent);
					pausa;

				case 'vcount':

					vcount = _ints (child.textContent);
					pausa;

				padrão:
					pausa;

			}

		}

		var index = 0;

		para (var i = 0; i <vcount.length; i ++) {

			var numBones = vcount [i];
			var vertex_weights = [];

			para (var j = 0; j <numBones; j ++) {

				var influência = {};

				para (var k = 0; k <inputs.length; k ++) {

					var input = inputs [k];
					var value = v [ índice + entrada.offset];

					switch (input.semantic) {

						case 'JOINT':

							influence.joint = valor; // this.joints [valor];
							pausa;

						case 'PESO':

							influence.weight = sources [input.source] .data [valor];
							pausa;

						padrão:
							pausa;

					}

				}

				vertex_weights.push (influência);
				index + = inputs.length;
			}

			para (var j = 0; j <vertex_weights.length; j ++) {

				vertex_weights [j] .index = i;

			}

			this.weights.push (vertex_weights);

		}

	};

	função VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Group ();

	}

	VisualScene.prototype.getChildById = function (id, recursivo) {

		para (var i = 0; i <this.nodes.length; i ++) {

			var node = this.nodes [i] .getChildById (id, recursivo);

			if (node) {

				nó de retorno;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = função (sid, recursiva) {

		para (var i = 0; i <this.nodes.length; i ++) {

			var node = this.nodes [i] .getChildBySid (sid, recursivo);

			if (node) {

				nó de retorno;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');
		this.nodes = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'node':

					this.nodes.push ((new Node ()) .parse (child));
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	function Node () {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4 ();

	}

	Node.prototype.getChannelForTransform = function (transformSid) {

		para (var i = 0; i <this.channels.length; i ++) {

			var channel = this.channels [i];
			var parts = channel.target.split ('/');
			var id = parts.shift ();
			var sid = parts.shift ();
			var dotSyntax = (sid.indexOf (".")> = 0);
			var arrSyntax = (sid.indexOf ("(")> = 0);
			var arrIndices;
			membro var;

			if (dotSyntax) {

				parts = sid.split (".");
				sid = parts.shift ();
				member = parts.shift ();

			} else if (arrSyntax) {

				arrIndices = sid.split ("(");
				sid = arrIndices.shift ();

				para (var j = 0; j <arrIndices.length; j ++) {

					arrIndices [j] = parseInt (arrIndices [j] .replace (/ \) /, ''));

				}

			}

			if (sid === transformSid) {

				channel.info = {sid: sid, dotSintax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices};
				canal de retorno;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function (id, recursivo) {

		if (this.id === id) {

			devolva isto;

		}

		if (recursivo) {

			para (var i = 0; i <this.nodes.length; i ++) {

				var n = this.nodes [i] .getChildById (id, recursivo);

				if (n) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function (sid, recursive) {

		if (this.sid === sid) {

			devolva isto;

		}

		if (recursivo) {

			para (var i = 0; i <this.nodes.length; i ++) {

				var n = this.nodes [i] .getChildBySid (sid, recursivo);

				if (n) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function (sid) {

		para (var i = 0; i <this.transforms.length; i ++) {

			if (this.transforms [i] .sid === sid) retorna this.transforms [i];

		}

		return null;

	};

	Node.prototype.parse = function (element) {

		var url;

		this.id = element.getAttribute ('id');
		this.sid = element.getAttribute ('sid');
		this.name = element.getAttribute ('nome');
		this.type = element.getAttribute ('type');
		this.layer = element.getAttribute ('camada');

		this.type = this.type === 'JOINT'? this.type: 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.lights = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4 ();

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'node':

					this.nodes.push ((new Node ()) .parse (child));
					pausa;

				case 'instance_camera':

					this.cameras.push ((new InstanceCamera ()) .parse (child));
					pausa;

				case 'instance_controller':

					this.controllers.push ((new InstanceController ()) .parse (child));
					pausa;

				case 'instance_geometry':

					this.geometries.push ((new InstanceGeometry ()) .parse (child));
					pausa;

				case 'instance_light':

					this.lights.push ((new InstanceLight ()) .parse (child));
					pausa;

				case 'instance_node':

					url = child.getAttribute ('url') .replace (/ ^ # /, '');
					var iNode = getLibraryNode (url);

					if (iNode) {

						this.nodes.push ((new Node ()) .parse (iNode));

					}

					pausa;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push ((new Transform ()) .parse (child));
					pausa;

				case 'extra':
					pausa;

				padrão:

					console.log (child.nodeName);
					pausa;

			}

		}

		this.channels = getChannelsForNode (isso);
		bakeAnimations (this);

		this.updateMatrix ();

		devolva isto;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity ();

		para (var i = 0; i <this.transforms.length; i ++) {

			this.transforms [i] .apply (esta.matriz);

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	}

	Transform.prototype.parse = function (element) {

		this.sid = element.getAttribute ('sid');
		this.type = element.nodeName;
		this.data = _floats (element.textContent);
		this.convert ();

		devolva isto;

	};

	Transform.prototype.convert = function () {

		switch (this.type) {

			case 'matrix':

				this.obj = getConvertedMat4 (this.data);
				pausa;

			case 'rotate':

				this.angle = THREE.Math.degToRad (this.data [3]);

			case 'translate':

				fixCoords (this.data, -1);
				this.obj = new THREE.Vector3 (this.data [0], this.data [1], this.data [2]);
				pausa;

			case 'scale':

				fixCoords (this.data, 1);
				this.obj = new THREE.Vector3 (this.data [0], this.data [1], this.data [2]);
				pausa;

			padrão:
				console.log ('Não é possível converter Transform of type' + this.type);
				pausa;

		}

	};

	Transform.prototype.apply = function () {

		var m1 = new THREE.Matrix4 ();

		função de retorno (matriz) {

			switch (this.type) {

				case 'matrix':

					matrix.multiply (this.obj);

					pausa;

				case 'translate':

					matrix.multiply (m1.makeTranslation (this.obj.x, this.obj.y, this.obj.z));

					pausa;

				case 'rotate':

					matrix.multiply (m1.makeRotationAxis (this.obj, this.angle));

					pausa;

				case 'scale':

					matrix.scale (this.obj);

					pausa;

			}

		};

	} ();

	Transform.prototype.update = function (data, member) {

		var members = ['X', 'Y', 'Z', 'ANGLE'];

		switch (this.type) {

			case 'matrix':

				if (! member) {

					this.obj.copy (dados);

				} else if (member.length === 1) {

					switch (membro [0]) {

						caso 0:

							this.obj.n11 = dados [0];
							this.obj.n21 = dados [1];
							this.obj.n31 = dados [2];
							this.obj.n41 = dados [3];

							pausa;

						caso 1:

							this.obj.n12 = dados [0];
							this.obj.n22 = dados [1];
							this.obj.n32 = dados [2];
							this.obj.n42 = dados [3];

							pausa;

						caso 2:

							this.obj.n13 = dados [0];
							this.obj.n23 = dados [1];
							this.obj.n33 = dados [2];
							this.obj.n43 = dados [3];

							pausa;

						caso 3:

							this.obj.n14 = dados [0];
							this.obj.n24 = dados [1];
							this.obj.n34 = dados [2];
							this.obj.n44 = dados [3];

							pausa;

					}

				} else if (member.length === 2) {

					var propName = 'n' + (membro [0] + 1) + (membro [1] + 1);
					this.obj [propName] = data;

				} outro {

					console.log ('Endereçamento incorreto da matriz em transformação');

				}

				pausa;

			case 'translate':
			case 'scale':

				if (Object.prototype.toString.call (membro) === '[array objeto]') {

					member = membros [membro [0]];

				}

				switch (membro) {

					caso 'X':

						this.obj.x = dados;
						pausa;

					caso 'Y':

						this.obj.y = dados;
						pausa;

					caso 'Z':

						this.obj.z = dados;
						pausa;

					padrão:

						this.obj.x = data [0];
						this.obj.y = dados [1];
						this.obj.z = dados [2];
						pausa;

				}

				pausa;

			case 'rotate':

				if (Object.prototype.toString.call (membro) === '[array objeto]') {

					member = membros [membro [0]];

				}

				switch (membro) {

					caso 'X':

						this.obj.x = dados;
						pausa;

					caso 'Y':

						this.obj.y = dados;
						pausa;

					caso 'Z':

						this.obj.z = dados;
						pausa;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad (dados);
						pausa;

					padrão:

						this.obj.x = data [0];
						this.obj.y = dados [1];
						this.obj.z = dados [2];
						this.angle = THREE.Math.degToRad (dados [3]);
						pausa;

				}
				pausa;

		}

	};

	function InstanceController () {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	}

	InstanceController.prototype.parse = function (element) {

		this.url = element.getAttribute ('url'). replace (/ ^ # /, '');
		this.skeleton = [];
		this.instance_material = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! == 1) continua;

			switch (child.nodeName) {

				case 'skeleton':

					this.skeleton.push (child.textContent.replace (/ ^ # /, ''));
					pausa;

				case 'bind_material':

					var instances = child.querySelectorAll ('instance_material');

					para (var j = 0; j <instâncias.length; j ++) {

						var instance = instances [j];
						this.instance_material.push ((new InstanceMaterial ()). parse (instância));

					}


					pausa;

				case 'extra':
					pausa;

				padrão:
					pausa;

			}
		}

		devolva isto;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	}

	InstanceMaterial.prototype.parse = function (element) {

		this.symbol = element.getAttribute ('símbolo');
		this.target = element.getAttribute ('target'). replace (/ ^ # /, '');
		devolva isto;

	};

	function InstanceGeometry () {

		this.url = "";
		this.instance_material = [];

	}

	InstanceGeometry.prototype.parse = function (element) {

		this.url = element.getAttribute ('url'). replace (/ ^ # /, '');
		this.instance_material = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			if (child.nodeName === 'bind_material') {

				var instances = child.querySelectorAll ('instance_material');

				para (var j = 0; j <instâncias.length; j ++) {

					var instance = instances [j];
					this.instance_material.push ((new InstanceMaterial ()). parse (instância));

				}

				pausa;

			}

		}

		devolva isto;

	};

	função Geometry () {

		this.id = "";
		this.mesh = nulo;

	}

	Geometry.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');

		extractDoubleSided (this, element);

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				case 'mesh':

					this.mesh = (new Mesh (this)). parse (filho);
					pausa;

				case 'extra':

					// console.log (filho);
					pausa;

				padrão:
					pausa;
			}
		}

		devolva isto;

	};

	função malha (geometria) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = nulo;
		this.geometry3js = nulo;

	}

	Mesh.prototype.parse = function (element) {

		this.primitives = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				case 'source':

					_source (filho);
					pausa;

				case 'vertices':

					this.vertices = (novos Vértices ()) .parse (filho);
					pausa;

				case 'linestrips':

					this.primitives.push ((new LineStrips (). parse (child)));
					pausa;

				case 'triângulos':

					this.primitives.push ((new Triangles (). parse (child)));
					pausa;

				caso 'polígonos':

					this.primitives.push ((novo Polygons (). parse (child)));
					pausa;

				caso 'polilista':

					this.primitives.push ((novo Polylist (). parse (child)));
					pausa;

				padrão:
					pausa;

			}

		}

		this.geometry3js = new THREE.Geometry ();

		if (this.vertices === null) {

			// TODO (mrdoob): estudo caso quando este é nulo (carrier.dae)

			devolva isto;

		}

		var vertexData = fontes [this.vertices.input ['POSITION']. source] .data;

		para (var i = 0; i <vertexData.length; i + = 3) {

			this.geometry3js.vertices.push (getConvertedVec3 (vertexData, i) .clone ());

		}

		para (var i = 0; i <this.primitives.length; i ++) {

			var primitive = this.primitives [i];
			primitive.setVertices (this.vertices);
			this.handlePrimitive (primitivo, this.geometry3js);

		}

		if (this.geometry3js.calcNormals) {

			this.geometry3js.computeVertexNormals ();
			delete this.geometry3js.calcNormals;

		}

		devolva isto;

	};

	Mesh.prototype.handlePrimitive = function (primitivo, geom) {

		if (exemplo primitivo de LineStrips) {

			// TODO: manipular índices. Talvez mais fácil com o BufferGeometry?

			geom.isLineStrip = true;
			Retorna;

		}

		var j, k, pList = primitivo.p, insumos = primitivo.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		para (j = 0; j <inputs.length; j ++) {

			entrada = entradas [j];

			var offset = input.offset + 1;
			maxOffset = (maxOffset <deslocamento)? deslocamento: maxOffset;

			switch (input.semantic) {

				caso 'TEXCOORD':
					texture_sets.push (input.set);
					pausa;

			}

		}

		para (var pCount = 0; pCount <pList.length; ++ pCount) {

			var p = pList [pCount], i = 0;

			while (i <p.length) {

				var vs = [];
				var ns = [];
				var ts = nulo;
				var cs = [];

				if (primitive.vcount) {

					vcount = primitive.vcount.length? primitive.vcount [vcIndex ++]: primitive.vcount;

				} outro {

					vcount = p.length / maxOffset;

				}


				para (j = 0; j <vcount; j ++) {

					para (k = 0; k <inputs.length; k ++) {

						entrada = entradas [k];
						fonte = fontes [input.source];

						índice = p [i + (j * maxOffset) + entrada.offset];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch (input.semantic) {

							caso 'VERTEX':

								vs.push (índice);

								pausa;

							caso 'NORMAL':

								ns.push (getConvertedVec3 (source.data, idx32));

								pausa;

							caso 'TEXCOORD':

								ts = ts || {};
								if (ts [input.set] === indefinido) ts [input.set] = [];
								// inverta o V
								ts [input.set] .push (novo THREE.Vector2 (source.data [idx32], source.data [idx32 + 1]));

								pausa;

							case 'COLOR':

								cs.push (new THREE.Color (). setRGB (fonte.data [idx32], fonte.data [idx32 + 1], source.data [idx32 + 2]));

								pausa;

							padrão:

								pausa;

						}

					}

				}

				if (ns.length === 0) {

					// verifica as entradas dos vértices
					input = this.vertices.input.NORMAL;

					if (input) {

						fonte = fontes [input.source];
						numParams = source.accessor.params.length;

						para (var ndx = 0, len = vs. comprimento; ndx <len; ndx ++) {

							ns.push (getConvertedVec3 (source.data, vs [ndx] * numParams));

						}

					} outro {

						geom.calcNormals = true;

					}

				}

				if (! ts) {

					ts = {};
					// verifica as entradas dos vértices
					input = this.vertices.input.TEXCOORD;

					if (input) {

						texture_sets.push (input.set);
						fonte = fontes [input.source];
						numParams = source.accessor.params.length;

						para (var ndx = 0, len = vs. comprimento; ndx <len; ndx ++) {

							idx32 = vs [ndx] * numParams;
							if (ts [input.set] === indefinido) ts [input.set] = [];
							// inverta o V
							ts [input.set] .push (novo THREE.Vector2 (source.data [idx32], 1.0 - source.data [idx32 + 1]));

						}

					}

				}

				if (cs.length === 0) {

					// verifica as entradas dos vértices
					input = this.vertices.input.COLOR;

					if (input) {

						fonte = fontes [input.source];
						numParams = source.accessor.params.length;

						para (var ndx = 0, len = vs. comprimento; ndx <len; ndx ++) {

							idx32 = vs [ndx] * numParams;
							cs.push (new THREE.Color (). setRGB (fonte.data [idx32], fonte.data [idx32 + 1], source.data [idx32 + 2]));

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if (vcount === 3) {

					faces.push (novo THREE.Face3 (vs [0], vs [1], vs [2], ns, cs.length? cs: novo THREE.Color ()));

				} else if (vcount === 4) {

					faces.push (novo THREE.Face3 (vs [0], vs [1], [3], ns.length? [ns [0] .clone (), ns [1] .clone (), ns [3 ] .clone ()]: [], cs.length? [cs [0], cs [1], cs [3]]: novo THREE.Color ()));

					faces.push (novo THREE.Face3 (vs [1], vs [2], vs [3], ns.length? [ns [1] .clone (), ns [2] .clone (), ns [3 ] .clone ()]: [], cs.length? [cs [1], cs [2], cs [3]]: novo THREE.Color ()));

				} else if (vcount> 4 && options.subdivideFaces) {

					var clr = cs.length? cs: novo THREE.Color (),
						vec1, vec2, vec3, v1, v2, norma;

					// subdivide em múltiplos Face3s

					para (k = 1; k <vcount - 1;) {

						faces.push (novo THREE.Face3 (vs [0], vs [k], vs [k + 1], ns.length? [ns [0] .clone (), ns [k ++]. clone () , ns [k] .clone ()]: [], clr));

					}

				}

				if (faces.length) {

					para (var ndx = 0, len = faces.length; ndx <len; ndx ++) {

						face = faces [ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push (face);

						para (k = 0; k <texture_sets.length; k ++) {

							uv = ts [texture_sets [k]];

							if (vcount> 4) {

								// Pegue os UVs corretos para os vértices nesta face
								uvArr = [uv [0], uv [ndx + 1], uv [ndx + 2]];

							} else if (vcount === 4) {

								if (ndx === 0) {

									uvArr = [uv [0], uv [1], uv [3]];

								} outro {

									uvArr = [uv [1] .clone (), uv [2], uv [3] .clone ()];

								}

							} outro {

								uvArr = [uv [0], uv [1], uv [2]];

							}

							if (geom.faceVertexUvs [k] === indefinido) {

								geom.faceVertexUvs [k] = [];

							}

							geom.faceVertexUvs [k] .push (uvArr);

						}

					}

				} outro {

					console.log ('drop face com vcount' + vcount + 'para geometria com id:' + geom.id);

				}

				i + = maxOffset * vcount;

			}

		}

	};

	Polígonos de função () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = nulo;
		this.p = [];
		this.geometry = new THREE.Geometry ();

	}

	Polygons.prototype.setVertices = function (vertices) {

		para (var i = 0; i <this.inputs.length; i ++) {

			if (this.inputs [i] .source === vertices.id) {

				this.inputs [i] .source = vertices.input ['POSITION'] .source;

			}

		}

	};

	Polygons.prototype.parse = function (element) {

		this.material = element.getAttribute ('material');
		this.count = _attr_as_int (element, 'count', 0);

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				caso 'entrada':

					this.inputs.push ((new Input ()) .parse (element.childNodes [i]));
					pausa;

				case 'vcount':

					this.vcount = _ints (child.textContent);
					pausa;

				case 'p':

					this.p.push (_ints (child.textContent));
					pausa;

				caso 'ph':

					console.warn ('buracos de polígono ainda não suportados!');
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	função Polylist () {

		Polygons.call (isso);

		this.vcount = [];

	}

	Polylist.prototype = Object.create (Polygons.prototype);
	Polylist.prototype.constructor = Polilista;

	função LineStrips () {

		Polygons.call (isso);

		this.vcount = 1;

	}

	LineStrips.prototype = Object.create (Polygons.prototype);
	LineStrips.prototype.constructor = LineStrips;

	função Triangles () {

		Polygons.call (isso);

		this.vcount = 3;

	}

	Triangles.prototype = Object.create (Polygons.prototype);
	Triangles.prototype.constructor = Triângulos;

	função Accessor () {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	}

	Accessor.prototype.parse = function (element) {

		this.params = [];
		this.source = element.getAttribute ('fonte');
		this.count = _attr_as_int (element, 'count', 0);
		this.stride = _attr_as_int (elemento, 'stride', 0);

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			if (child.nodeName === 'param') {

				var param = {};
				param ['name'] = child.getAttribute ('name');
				param ['type'] = child.getAttribute ('type');
				this.params.push (param);

			}

		}

		devolva isto;

	};

	função Vertices () {

		this.input = {};

	}

	Vertices.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');

		para (var i = 0; i <element.childNodes.length; i ++) {

			if (element.childNodes [i] .nodeName === 'entrada') {

				var input = (new Input ()) .parse (element.childNodes [i]);
				this.input [input.semantic] = entrada;

			}

		}

		devolva isto;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	}

	Input.prototype.parse = function (element) {

		this.semantic = element.getAttribute ('semântico');
		this.source = element.getAttribute ('source'). replace (/ ^ # /, '');
		this.set = _attr_as_int (elemento, 'conjunto', -1);
		this.offset = _attr_as_int (elemento, 'offset', 0);

		if (this.semantic === 'TEXCOORD' && this.set <0) {

			this.set = 0;

		}

		devolva isto;

	};

	function Fonte (id) {

		this.id = id;
		this.type = null;

	}

	Source.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				case 'bool_array':

					this.data = _bools (child.textContent);
					this.type = child.nodeName;
					pausa;

				case 'float_array':

					this.data = _floats (child.textContent);
					this.type = child.nodeName;
					pausa;

				case 'int_array':

					this.data = _ints (child.textContent);
					this.type = child.nodeName;
					pausa;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings (child.textContent);
					this.type = child.nodeName;
					pausa;

				case 'technique_common':

					para (var j = 0; j <child.childNodes.length; j ++) {

						if (child.childNodes [j] .nodeName === 'accessor') {

							this.accessor = (novo Accessor ()) .parse (child.childNodes [j]);
							pausa;

						}
					}
					pausa;

				padrão:
					// console.log (child.nodeName);
					pausa;

			}

		}

		devolva isto;

	};

	Source.prototype.read = function () {

		var result = [];

		// para (var i = 0; i <this.accessor.params.length; i ++) {

		var param = this.accessor.params [0];

			//console.log(param.name + "" + param.type);

		switch (param.type) {

			caso 'IDREF':
			case 'Name': case 'name':
			case 'float':

				return this.data;

			case 'float4x4':

				para (var j = 0; j <this.data.length; j + = 16) {

					var s = this.data.slice (j, j + 16);
					var m = getConvertedMat4 (s);
					result.push (m);
				}

				pausa;

			padrão:

				console.log ('ColladaLoader: Source: Read não sabe ler' + param.type + '.');
				pausa;

		}

		//}

		resultado de retorno;

	};

	função Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	}

	Material.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');

		para (var i = 0; i <element.childNodes.length; i ++) {

			if (element.childNodes [i] .nodeName === 'instance_effect') {

				this.instance_effect = (new InstanceEffect ()) .parse (element.childNodes [i]);
				pausa;

			}

		}

		devolva isto;

	};

	função ColorOrTexture () {

		this.color = new THREE.Color ();
		this.color.setRGB (Math.random (), Math.random (), Math.random ());
		this.color.a = 1,0;

		this.texture = null;
		this.texcoord = nulo;
		this.texOpts = nulo;

	}

	ColorOrTexture.prototype.isColor = function () {

		return (this.texture === null);

	};

	ColorOrTexture.prototype.isTexture = function () {

		return (this.texture! = null);

	};

	ColorOrTexture.prototype.parse = function (element) {

		if (element.nodeName === 'transparent') {

			this.opaque = element.getAttribute ('opaco');

		}

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'color':

					var rgba = _floats (child.textContent);
					this.color = new THREE.Color ();
					this.color.setRGB (rgba [0], rgba [1], rgba [2]);
					this.color.a = rgba [3];
					pausa;

				case 'texture':

					this.texture = child.getAttribute ('textura');
					this.texcoord = child.getAttribute ('texcoord');
					// Padrões de:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1
					};
					this.parseTexture (filho);
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	ColorOrTexture.prototype.parseTexture = function (element) {

		if (! element.childNodes) retorna isso;

		// Isso deve ser suportado pelo Maya, 3dsMax e MotionBuilder

		if (element.childNodes [1] && element.childNodes [1] .nodeName === 'extra') {

			element = element.childNodes [1];

			if (element.childNodes [1] && element.childNodes [1] .nodeName === 'técnica') {

				element = element.childNodes [1];

			}

		}

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts [child.nodeName] = parseFloat (child.textContent);

					pausa;

				case 'wrapU':
				case 'wrapV':

					// algum dae tem um valor de true que se torna NaN via parseInt

					if (child.textContent.toUpperCase () === 'TRUE') {

						this.texOpts [child.nodeName] = 1;

					} outro {

						this.texOpts [child.nodeName] = parseInt (child.textContent);

					}
					pausa;

				padrão:

					this.texOpts [child.nodeName] = child.textContent;

					pausa;

			}

		}

		devolva isto;

	};

	função Shader (tipo, efeito) {

		this.type = type;
		this.effect = efeito;
		este.material = nulo;

	}

	Shader.prototype.parse = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				Caso 'emissão':
				caso 'difuso':
				caso 'especular':
				case 'transparent':

					this [child.nodeName] = (novo ColorOrTexture ()) .parse (filho);
					pausa;

				case 'bump':

					// Se 'bumptype' for 'heightfield', crie uma propriedade 'bump'
					// Senão, se 'bumptype' é 'normalmap', crie uma propriedade 'normal'
					// (padrão para 'bump')
					var bumpType = child.getAttribute ('bumptype');
					if (bumpType) {
						if (bumpType.toLowerCase () === "heightfield") {
							this ['bump'] = (new ColorOrTexture ()) .parse (filho);
						} else if (bumpType.toLowerCase () === "normalmap") {
							this ['normal'] = (novo ColorOrTexture ()) .parse (filho);
						} outro {
							console.error ("Shader.prototype.parse: Valor inválido para o atributo 'bumptype' (" + bumpType + ") - bumptypes válidos são 'HEIGHTFIELD' e 'NORMALMAP' - padronizando para 'HEIGHTFIELD'");
							this ['bump'] = (new ColorOrTexture ()) .parse (filho);
						}
					} outro {
						console.warn ("Shader.prototype.parse: Atributo 'bumptype' ausente do nó bump - padronizado como 'HEIGHTFIELD'");
						this ['bump'] = (new ColorOrTexture ()) .parse (filho);
					}

					pausa;

				case 'shininess':
				case 'refletividade':
				case 'index_of_refraction':
				case 'transparência':

					var f = child.querySelectorAll ('float');

					if (f.length> 0)
						this [child.nodeName] = parseFloat (f [0] .textContent);

					pausa;

				padrão:
					pausa;

			}

		}

		this.create ();
		devolva isto;

	};

	Shader.prototype.create = function () {

		var props = {};

		var transparent = false;

		if (this ['transparency']! == undefined && this ['transparent']! == indefinido) {
			// converte o RBG de cor transparente em valor médio
			var transparentColor = esta ['transparente'];
			var transparencyLevel = (this.transparent.color.r + this.transparent.color.g + this.transparent.color.b) / 3 * this.transparency;

			if (transparencyLevel> 0) {
				transparent = true;
				props ['transparent'] = true;
				adereços ['opacidade'] = 1 - transparencyLevel;

			}

		}

		var keys = {
			'difuso': 'mapa',
			'ambient': 'lightMap',
			'especular': 'specularMap',
			«emissão»: «mapa das emissões»,
			'bump': 'bumpMap',
			'normal': 'normalMap'
			};

		para (var prop this) {

			interruptor (prop) {

				case 'ambient':
				Caso 'emissão':
				caso 'difuso':
				caso 'especular':
				case 'bump':
				case 'normal':

					var cot = isto [prop];

					if (cot instanceof ColorOrTexture) {

						if (cot.isTexture ()) {

							var samplerId = cot.texture;
							var surfaceId = this.effect.sampler [samplerId];

							if (surfaceId! == undefined && surfaceId.source! == undefined) {

								var surface = this.effect.surface [surfaceId.source];

								if (superfície! == indefinido) {

									var image = images [surface.init_from];

									if (image) {

										var url = baseUrl + image.init_from;

										var textura;
										var loader = THREE.Loader.Handlers.get (url);

										if (loader! == null) {

											texture = loader.load (url);

										} outro {

											texture = new THREE.Texture ();

											loadTextureImage (textura, url);

										}

										texture.wrapS = cot.texOpts.wrapU? THREE.RepeatWrapping: THREE.ClampToEdgeWrapping;
										texture.wrapT = cot.texOpts.wrapV? THREE.RepeatWrapping: THREE.ClampToEdgeWrapping;
										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										adereços [keys [prop]] = textura;

										// Textura com iluminação de forno?
										if (prop === 'emission') props ['emissivo'] = 0xffffff;

									}

								}

							}

						} else if (prop === 'difuso' ||! transparente) {

							if (prop === 'emissão') {

								adereços ['emissivo'] = cot.color.getHex ();

							} outro {

								props [prop] = cot.color.getHex ();

							}

						}

					}

					pausa;

				case 'shininess':

					adereços [prop] = isto [prop];
					pausa;

				case 'refletividade':

					adereços [prop] = isto [prop];
					if (props [prop]> 0.0) props ['envMap'] = opções.defaultEnvMap;
					adereços ['combinar'] = THREE.MixOperação; // mistura sombreamento regular com componente reflexivo
					pausa;

				case 'index_of_refraction':

					adereços ['refractionRatio'] = isto [prop]; // TODO: "index_of_refraction" se torna "refractionRatio" no shader, mas não tenho certeza se os dois são realmente comparáveis
					if (this [prop]! == 1.0) props ['envMap'] = opções.defaultEnvMap;
					pausa;

				case 'transparência':
					// é descoberto no topo
					pausa;

				padrão:
					pausa;

			}

		}

		props ['shading'] = preferredShading;
		props ['side'] = this.effect.doubleSided? THREE.DoubleSide: THREE.FrontSide;

		if (props.diffuse! == undefined) {

			props.color = props.diffuse;
			delete props.diffuse;

		}

		switch (this.type) {

			caso 'constante':

				if (props.emissivo! = indefinido) props.color = props.emissivo;
				this.material = new THREE.MeshBasicMaterial (adereços);
				pausa;

			caso 'phong':
			case 'blinn':

				this.material = new THREE.MeshPhongMaterial (adereços);
				pausa;

			case 'lambert':
			padrão:

				this.material = new THREE.MeshLambertMaterial (adereços);
				pausa;

		}

		devolve este material;

	};

	função Superfície (efeito) {

		this.effect = efeito;
		this.init_from = null;
		this.format = nulo;

	}

	Surface.prototype.parse = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'init_from':

					this.init_from = child.textContent;
					pausa;

				case 'format':

					this.format = child.textContent;
					pausa;

				padrão:

					console.log ("prop não-tratado de superfície:" + child.nodeName);
					pausa;

			}

		}

		devolva isto;

	};

	função Sampler2D (efeito) {

		this.effect = efeito;
		this.source = nulo;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = nulo;
		this.magfilter = nulo;
		this.mipfilter = nulo;

	}

	Sampler2D.prototype.parse = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'source':

					this.source = child.textContent;
					pausa;

				case 'minfilter':

					this.minfilter = child.textContent;
					pausa;

				case 'magfilter':

					this.magfilter = child.textContent;
					pausa;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					pausa;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					pausa;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					pausa;

				padrão:

					console.log ("não manipulado Sampler2D prop:" + child.nodeName);
					pausa;

			}

		}

		devolva isto;

	};

	function Efeito () {

		this.id = "";
		this.name = "";
		this.shader = nulo;
		this.surface = {};
		this.sampler = {};

	}

	Effect.prototype.create = function () {

		if (this.shader === null) {

			return null;

		}

	};

	Effect.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');

		extractDoubleSided (this, element);

		this.shader = nulo;

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'profile_COMMON':

					this.parseTechnique (this.parseProfileCOMMON (child));
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	Effect.prototype.parseNewparam = function (element) {

		var sid = element.getAttribute ('sid');

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'surface':

					this.surface [sid] = (novo Surface (this)) .parse (filho);
					pausa;

				case 'sampler2D':

					this.sampler [sid] = (novo Sampler2D (this)) .parse (child);
					pausa;

				case 'extra':

					pausa;

				padrão:

					console.log (child.nodeName);
					pausa;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function (element) {

		var técnica;

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'profile_COMMON':

					this.parseProfileCOMMON (filho);
					pausa;

				caso 'técnica':

					técnica = criança;
					pausa;

				case 'newparam':

					this.parseNewparam (filho);
					pausa;

				case 'image':

					var _image = (novo _Image ()) .parse (filho);
					imagens [_image.id] = _imagem;
					pausa;

				case 'extra':
					pausa;

				padrão:

					console.log (child.nodeName);
					pausa;

			}

		}

		técnica de retorno;

	};

	Effect.prototype.parseTechnique = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				caso 'constante':
				case 'lambert':
				case 'blinn':
				caso 'phong':

					this.shader = (novo Shader (child.nodeName, this)) .parse (filho);
					pausa;
				case 'extra':
					this.parseExtra (criança);
					pausa;
				padrão:
					pausa;

			}

		}

	};

	Effect.prototype.parseExtra = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				caso 'técnica':
					this.parseExtraTechnique (criança);
					pausa;
				padrão:
					pausa;

			}

		}

	};

	Effect.prototype.parseExtraTechnique = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'bump':
					this.shader.parse (elemento);
					pausa;
				padrão:
					pausa;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	}

	InstanceEffect.prototype.parse = function (element) {

		this.url = element.getAttribute ('url') .replace (/ ^ # /, '');
		devolva isto;

	};

	função Animation () {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	}

	Animation.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');
		this.source = {};

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'animação':

					var anim = (novo Animation ()) .parse (filho);

					para (var src em anim.source) {

						this.source [src] = anim.source [src];

					}

					para (var j = 0; j <anim.channel.length; j ++) {

						this.channel.push (anim.channel [j]);
						this.sampler.push (anim.sampler [j]);

					}

					pausa;

				case 'source':

					var src = (new Source ()) .parse (filho);
					this.source [src.id] = src;
					pausa;

				case 'sampler':

					this.sampler.push ((novo Sampler (this)) .parse (child));
					pausa;

				case 'channel':

					this.channel.push ((new Channel (this)) .parse (filho));
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	canal de função (animação) {

		this.animation = animação;
		this.source = "";
		this.target = "";
		this.fullSid = nulo;
		this.sid = nulo;
		this.dotSyntax = null;
		this.arrSyntax = nulo;
		this.arrIndices = nulo;
		this.member = nulo;

	}

	Channel.prototype.parse = function (element) {

		this.source = element.getAttribute ('source') .replace (/ ^ # /, '');
		this.target = element.getAttribute ('target');

		var parts = this.target.split ('/');

		var id = parts.shift ();
		var sid = parts.shift ();

		var dotSyntax = (sid.indexOf (".")> = 0);
		var arrSyntax = (sid.indexOf ("(")> = 0);

		if (dotSyntax) {

			parts = sid.split (".");
			this.sid = parts.shift ();
			this.member = parts.shift ();

		} else if (arrSyntax) {

			var arrIndices = sid.split ("(");
			this.sid = arrIndices.shift ();

			para (var j = 0; j <arrIndices.length; j ++) {

				arrIndices [j] = parseInt (arrIndices [j] .replace (/ \) /, ''));

			}

			this.arrIndices = arrIndices;

		} outro {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		devolva isto;

	};

	Função Sampler (animação) {

		this.id = "";
		this.animation = animação;
		this.inputs = [];
		this.input = nulo;
		this.output = nulo;
		this.strideOut = nulo;
		this.interpolation = nulo;
		this.startTime = nulo;
		this.endTime = nulo;
		this.duration = 0;

	}

	Sampler.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.inputs = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				caso 'entrada':

					this.inputs.push ((new Input ()). parse (child));
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	Sampler.prototype.create = function () {

		para (var i = 0; i <this.inputs.length; i ++) {

			var input = this.inputs [i];
			var source = this.animation.source [input.source];

			switch (input.semantic) {

				case 'INPUT':

					this.input = source.read ();
					pausa;

				case 'OUTPUT':

					this.output = source.read ();
					this.strideOut = source.accessor.stride;
					pausa;

				Caso 'INTERPOLAÇÃO':

					this.interpolation = source.read ();
					pausa;

				case 'IN_TANGENT':

					pausa;

				caso 'OUT_TANGENT':

					pausa;

				padrão:

					console.log (input.semantic);
					pausa;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if (this.input.length) {

			this.startTime = 100000000;
			this.endTime = -100000000;

			para (var i = 0; i <this.input.length; i ++) {

				this.startTime = Math.min (this.startTime, this.input [i]);
				this.endTime = Math.max (this.endTime, this.input [i]);

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function (type, ndx, member) {

		var dados;

		if (tipo === 'matriz' && this.strideOut === 16) {

			data = this.output [ndx];

		} else if (this.strideOut> 1) {

			data = [];
			ndx * = this.strideOut;

			para (var i = 0; i <this.strideOut; ++ i) {

				dados [i] = this.output [ndx + i];

			}

			if (this.strideOut === 3) {

				switch (type) {

					case 'rotate':
					case 'translate':

						fixCoords (dados, -1);
						pausa;

					case 'scale':

						fixCoords (dados, 1);
						pausa;

				}

			} else if (this.strideOut === 4 && type === 'matrix') {

				fixCoords (dados, -1);

			}

		} outro {

			data = this.output [ndx];

			if (membro && type === 'translate') {
				data = getConvertedTranslation (membro, dados);
			}

		}

		dados de retorno;

	};

	Tecla de função (tempo) {

		this.targets = [];
		this.time = tempo;

	}

	Key.prototype.addTarget = function (fullSid, ​​transform, membro, dados) {

		this.targets.push ({
			sid: fullSid,
			membro: membro,
			transformar: transformar
			dados: dados
		});

	};

	Key.prototype.apply = function (opt_sid) {

		para (var i = 0; i <this.targets.length; ++ i) {

			var target = this.targets [i];

			if (! opt_sid || target.sid === opt_sid) {

				target.transform.update (target.data, target.member);

			}

		}

	};

	Key.prototype.getTarget = function (fullSid) {

		para (var i = 0; i <this.targets.length; ++ i) {

			if (this.targets [i] .sid === fullSid) {

				return this.targets [i];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function (fullSid) {

		para (var i = 0; i <this.targets.length; ++ i) {

			if (this.targets [i] .sid === fullSid) {

				retorno verdadeiro;

			}

		}

		retorna falso;

	};

	// TODO: Atualmente fazendo apenas interpolação linear. Deve suportar especificações completas de COLLADA.
	Key.prototype.interpolate = function (nextKey, time) {

		para (var i = 0, l = this.targets.length; i <l; i ++) {

			var target = this.targets [i],
				nextTarget = nextKey.getTarget (target.sid),
				dados;

			if (target.transform.type! == 'matrix' && nextTarget) {

				var scale = (time - this.time) / (nextKey.time - this.time),
					nextData = nextTarget.data,
					prevData = target.data;

				escala if (escala <0) = 0;
				se (escala> 1) escala = 1;

				if (prevData.length) {

					data = [];

					para (var j = 0; j <prevData.length; ++ j) {

						dados [j] = prevData [j] + (nextData [j] - prevData [j]) * escala;

					}

				} outro {

					data = prevData + (nextData - prevData) * escala;

				}

			} outro {

				data = target.data;

			}

			target.transform.update (data, target.member);

		}

	};

	// Câmera
	função Camera () {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Camera.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'optics':

					this.parseOptics (filho);
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	Camera.prototype.parseOptics = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			if (element.childNodes [i] .nodeName === 'technique_common') {

				var técnica = element.childNodes [i];

				para (var j = 0; j <technique.childNodes.length; j ++) {

					this.technique = technique.childNodes [j] .nodeName;

					if (this.technique === 'perspective') {

						var perspective = technique.childNodes [j];

						para (var k = 0; k <perspective.childNodes.length; k ++) {

							var param = perspective.childNodes [k];

							switch (param.nodeName) {

								caso 'yfov':
									this.yfov = param.textContent;
									pausa;
								case 'xfov':
									this.xfov = param.textContent;
									pausa;
								caso 'znear':
									this.znear = param.textContent;
									pausa;
								case 'zfar':
									this.zfar = param.textContent;
									pausa;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									pausa;

							}

						}

					} else if (this.technique === 'orthographic') {

						var orthographic = technique.childNodes [j];

						para (var k = 0; k <orthographic.childNodes.length; k ++) {

							var param = orthographic.childNodes [k];

							switch (param.nodeName) {

								case 'xmag':
									this.xmag = param.textContent;
									pausa;
								caso 'ymag':
									this.ymag = param.textContent;
									pausa;
								caso 'znear':
									this.znear = param.textContent;
									pausa;
								case 'zfar':
									this.zfar = param.textContent;
									pausa;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									pausa;

							}

						}

					}

				}

			}

		}

		devolva isto;

	};

	função InstanceCamera () {

		this.url = "";

	}

	InstanceCamera.prototype.parse = function (element) {

		this.url = element.getAttribute ('url'). replace (/ ^ # /, '');

		devolva isto;

	};

	// Luz

	função Light () {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Light.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'technique_common':

					this.parseCommon (filho);
					pausa;

				caso 'técnica':

					this.parseTechnique (criança);
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	Light.prototype.parseCommon = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			switch (element.childNodes [i] .nodeName) {

				case 'direcional':
				caso 'ponto':
				case 'spot':
				case 'ambient':

					this.technique = element.childNodes [i] .nodeName;

					var light = element.childNodes [i];

					para (var j = 0; j <light.childNodes.length; j ++) {

						var child = light.childNodes [j];

						switch (child.nodeName) {

							case 'color':

								var rgba = _floats (child.textContent);
								this.color = new THREE.Color (0);
								this.color.setRGB (rgba [0], rgba [1], rgba [2]);
								this.color.a = rgba [3];
								pausa;

							case 'falloff_angle':

								this.falloff_angle = parseFloat (child.textContent);
								pausa;

							case 'quadratic_attenuation':
								var f = parseFloat (child.textContent);
								this.distance = f? Math.sqrt (1 / f): 0;
						}

					}

			}

		}

		devolva isto;

	};

	Light.prototype.parseTechnique = function (element) {

		this.profile = element.getAttribute ('perfil');

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];

			switch (child.nodeName) {

				caso 'intensidade':

					this.intensity = parseFloat (child.textContent);
					pausa;

			}

		}

		devolva isto;

	};

	function InstanceLight () {

		this.url = "";

	}

	InstanceLight.prototype.parse = function (element) {

		this.url = element.getAttribute ('url'). replace (/ ^ # /, '');

		devolva isto;

	};

	função KinematicsModel () {

		this.id = '';
		this.name = '';
		this.joints = [];
		this.links = [];

	}

	KinematicsModel.prototype.parse = function (element) {

		this.id = element.getAttribute ('id');
		this.name = element.getAttribute ('nome');
		this.joints = [];
		this.links = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'technique_common':

					this.parseCommon (filho);
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	KinematicsModel.prototype.parseCommon = function (element) {

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (element.childNodes [i] .nodeName) {

				case 'joint':
					this.joints.push ((novo Joint ()). parse (child));
					pausa;

				case 'link':
					this.links.push ((new Link ()). parse (child));
					pausa;

				padrão:
					pausa;

			}

		}

		devolva isto;

	};

	function Joint () {

		this.sid = '';
		this.name = '';
		this.axis = new THREE.Vector3 ();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = falso;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

	}

	Joint.prototype.parse = function (element) {

		this.sid = element.getAttribute ('sid');
		this.name = element.getAttribute ('nome');
		this.axis = new THREE.Vector3 ();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = falso;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

		var axisElement = element.querySelector ('eixo');
		var _axis = _floats (axisElement.textContent);
		this.axis = getConvertedVec3 (_axis, 0);

		var min = element.querySelector ('limita min')? parseFloat (element.querySelector ('limites min'). textContent): -360;
		var max = element.querySelector ('limites max')? parseFloat (element.querySelector ('limits max'). textContent): 360;

		this.limits = {
			min: min
			max: max
		};

		var jointTypes = ['prismático', 'revolute'];
		para (var i = 0; i <jointTypes.length; i ++) {

			var type = jointTypes [i];

			var jointElement = element.querySelector (tipo);

			if (jointElement) {

				this.type = type;

			}

		}

		// se o min for igual ou maior que o max, considere a estática conjunta
		if (this.limits.min> = this.limits.max) {

			this.static = true;

		}

		this.middlePosition = (this.limits.min + this.limits.max) / 2.0;
		devolva isto;

	};

	função Link () {

		this.sid = '';
		this.name = '';
		this.transforms = [];
		this.attachments = [];

	}

	Link.prototype.parse = function (element) {

		this.sid = element.getAttribute ('sid');
		this.name = element.getAttribute ('nome');
		this.transforms = [];
		this.attachments = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'attachment_full':
					this.attachments.push ((new Attachment ()). parse (filho));
					pausa;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push ((new Transform ()). parse (child));
					pausa;

				padrão:

					pausa;

			}

		}

		devolva isto;

	};

	function Attachment () {

		this.joint = '';
		this.transforms = [];
		this.links = [];

	}

	Attachment.prototype.parse = function (element) {

		this.joint = element.getAttribute ('conjunto'). split ('/'). pop ();
		this.links = [];

		para (var i = 0; i <element.childNodes.length; i ++) {

			var child = element.childNodes [i];
			if (child.nodeType! = 1) continua;

			switch (child.nodeName) {

				case 'link':
					this.links.push ((new Link ()). parse (child));
					pausa;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push ((new Transform ()). parse (child));
					pausa;

				padrão:

					pausa;

			}

		}

		devolva isto;

	};

	função _source (element) {

		var id = element.getAttribute ('id');

		if (fontes [id]! = indefinido) {

			fontes de retorno [id];

		}

		fontes [id] = (nova Fonte (id)). parse (elemento);
		fontes de retorno [id];

	}

	função _nsResolver (nsPrefix) {

		if (nsPrefix === "dae") {

			retornar "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	}

	função _bools (str) {

		var raw = _strings (str);
		var data = [];

		para (var i = 0, l = raw.length; i <l; i ++) {

			data.push ((raw [i] === 'true' || raw [i] === '1')? true: false);

		}

		dados de retorno;

	}

	function _floats (str) {

		var raw = _strings (str);
		var data = [];

		para (var i = 0, l = raw.length; i <l; i ++) {

			data.push (parseFloat (raw [i]));

		}

		dados de retorno;

	}

	função _ints (str) {

		var raw = _strings (str);
		var data = [];

		para (var i = 0, l = raw.length; i <l; i ++) {

			data.push (parseInt (raw [i], 10));

		}

		dados de retorno;

	}

	function _strings (str) {

		return (str.length> 0)? _trimString (str) .split (/ \ s + /): [];

	}

	function _trimString (str) {

		return str.replace (/ ^ \ s + /, "") .replace (/ \ s + $ /, "");

	}

	function _attr_as_float (element, name, defaultValue) {

		if (element.hasAttribute (name)) {

			return parseFloat (element.getAttribute (name));

		} outro {

			return defaultValue;

		}

	}

	function _attr_as_int (element, name, defaultValue) {

		if (element.hasAttribute (name)) {

			return parseInt (element.getAttribute (nome), 10);

		} outro {

			return defaultValue;

		}

	}

	function _attr_as_string (element, name, defaultValue) {

		if (element.hasAttribute (name)) {

			return element.getAttribute (nome);

		} outro {

			return defaultValue;

		}

	}

	função _format_float (f, num) {

		if (f === indefinido) {

			var s = '0.';

			while (s.length <num + 2) {

				s + = '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString (). split ('.');
		partes [1] = partes.length> 1? partes [1] .substr (0, num): "0";

		while (partes [1] .comprimento <num) {

			partes [1] + = '0';

		}

		return parts.join ('.');

	}

	function loadTextureImage (textura, url) {

		var loader = novo THREE.ImageLoader ();

		loader.load (url, função (imagem) {

			texture.image = imagem;
			texture.needsUpdate = true;

		});

	}

	function extractDoubleSided (obj, element) {

		obj.doubleSided = false;

		var node = element.querySelectorAll ('extra double_sided') [0];

		if (node) {

			if (node ​​&& parseInt (node.textContent, 10) === 1) {

				obj.doubleSided = true;

			}

		}

	}

	// Up axis conversion

	função setUpConversion () {

		if (options.convertUpAxis! == true || colladaUp === options.upAxis) {

			upConversion = nulo;

		} outro {

			switch (colladaUp) {

				caso 'X':

					upConversion = options.upAxis === 'Y'? 'XtoY': 'XtoZ';
					pausa;

				caso 'Y':

					upConversion = options.upAxis === 'X'? 'YtoX': 'YtoZ';
					pausa;

				caso 'Z':

					upConversion = options.upAxis === 'X'? 'ZtoX': 'ZtoY';
					pausa;

			}

		}

	}

	função fixCoords (data, sign) {

		if (options.convertUpAxis! == true || colladaUp === options.upAxis) {

			Retorna;

		}

		switch (upConversion) {

			caso 'XtoY':

				var tmp = dados [0];
				dados [0] = assinar * dados [1];
				dados [1] = tmp;
				pausa;

			caso 'XtoZ':

				var tmp = dados [2];
				dados [2] = dados [1];
				dados [1] = dados [0];
				data [0] = tmp;
				pausa;

			caso 'YtoX':

				var tmp = dados [0];
				dados [0] = dados [1];
				data [1] = assinar * tmp;
				pausa;

			caso 'YtoZ':

				var tmp = dados [1];
				dados [1] = assinar * dados [2];
				dados [2] = tmp;
				pausa;

			caso 'ZtoX':

				var tmp = dados [0];
				dados [0] = dados [1];
				dados [1] = dados [2];
				dados [2] = tmp;
				pausa;

			caso 'ZtoY':

				var tmp = dados [1];
				dados [1] = dados [2];
				data [2] = assinar * tmp;
				pausa;

		}

	}

	function getConvertedTranslation (axis, data) {

		if (options.convertUpAxis! == true || colladaUp === options.upAxis) {

			dados de retorno;

		}

		interruptor (eixo) {
			caso 'X':
				data = upConversion === 'XtoY'? dados * -1: dados;
				pausa;
			caso 'Y':
				data = upConversion === 'YtoZ' || upConversion === 'YtoX'? dados * -1: dados;
				pausa;
			caso 'Z':
				data = upConversion === 'ZtoY'? dados * -1: dados;
				pausa;
			padrão:
				pausa;
		}

		dados de retorno;
	}

	função getConvertedVec3 (data, offset) {

		var arr = [dados [offset], dados [offset + 1], dados [offset + 2]];
		fixCoords (arr, -1);
		return new THREE.Vector3 (arr [0], arr [1], arr [2]);

	}

	function getConvertedMat4 (data) {

		if (options.convertUpAxis) {

			// Primeiro, corrija a rotação e a escala

			// Colunas primeiro
			var arr = [dados [0], dados [4], dados [8]];
			fixCoords (arr, -1);
			dados [0] = arr [0];
			dados [4] = arr [1];
			dados [8] = arr [2];
			arr = [dados [1], dados [5], dados [9]];
			fixCoords (arr, -1);
			dados [1] = arr [0];
			dados [5] = arr [1];
			dados [9] = arr [2];
			arr = [dados [2], dados [6], dados [10]];
			fixCoords (arr, -1);
			dados [2] = arr [0];
			dados [6] = arr [1];
			dados [10] = arr [2];
			// Rows second
			arr = [dados [0], dados [1], dados [2]];
			fixCoords (arr, -1);
			dados [0] = arr [0];
			dados [1] = arr [1];
			dados [2] = arr [2];
			arr = [dados [4], dados [5], dados [6]];
			fixCoords (arr, -1);
			dados [4] = arr [0];
			dados [5] = arr [1];
			dados [6] = arr [2];
			arr = [dados [8], dados [9], dados [10]];
			fixCoords (arr, -1);
			dados [8] = arr [0];
			dados [9] = arr [1];
			dados [10] = arr [2];

			// Agora corrigir tradução
			arr = [dados [3], dados [7], dados [11]];
			fixCoords (arr, -1);
			dados [3] = arr [0];
			dados [7] = arr [1];
			dados [11] = arr [2];

		}

		return new THREE.Matrix4 (). set (
			dados [0], dados [1], dados [2], dados [3],
			dados [4], dados [5], dados [6], dados [7],
			dados [8], dados [9], dados [10], dados [11],
			dados [12], dados [13], dados [14], dados [15]
			);

	}

	function getConvertedIndex (index) {

		if (index> -1 && index <3) {

			var members = ['X', 'Y', 'Z'],
				índices = {X: 0, Y: 1, Z: 2};

			índice = getConvertedMember (membros [índice]);
			índice = índices [índice];

		}

		índice de retorno;

	}

	function getConvertedMember (membro) {

		if (options.convertUpAxis) {

			switch (membro) {

				caso 'X':

					switch (upConversion) {

						caso 'XtoY':
						caso 'XtoZ':
						caso 'YtoX':

							member = 'Y';
							pausa;

						caso 'ZtoX':

							member = 'Z';
							pausa;

					}

					pausa;

				caso 'Y':

					switch (upConversion) {

						caso 'XtoY':
						caso 'YtoX':
						caso 'ZtoX':

							member = 'X';
							pausa;

						caso 'XtoZ':
						caso 'YtoZ':
						caso 'ZtoY':

							member = 'Z';
							pausa;

					}

					pausa;

				caso 'Z':

					switch (upConversion) {

						caso 'XtoZ':

							member = 'X';
							pausa;

						caso 'YtoZ':
						caso 'ZtoX':
						caso 'ZtoY':

							member = 'Y';
							pausa;

					}

					pausa;

			}

		}

		membro de retorno;

	}

	Retorna {

		carga: carga,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometrias: geometrias,
		opções: opções

	};

};