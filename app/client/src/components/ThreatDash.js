import React, {useState} from "react";
import "./LandingPage.css"
import "./ThreatDash.css"

function ThreatDash() {
	const [input1, onChangeInput1] = useState('');
	return (
		<div className="contain">

			<div className="scroll-view">
				<div className="view">
					<span className="text" >
						{"Threat Dashboard"}
					</span>
				</div>
				<div className="row-view">
					<div className="column">
						<div className="view2">
							<span className="text2" >
								{"Real-time Threat Visualization"}
							</span>
						</div>
						<div className="view3">
							<div className="view4">
								<span className="text3" >
									{"AI-powered charts on attack vectors"}
								</span>
							</div>
						</div>
					</div>
					<div className="column2">
						<div className="view2">
							<span className="text2" >
								{"Logs & Event Analysis"}
							</span>
						</div>
						<input
							placeholder={"Filter logs..."}
							value={input1}
							onChange={(event)=>onChangeInput1(event.target.value)}
							className="input"
						/>
						<div className="view5">
							<div className="column3">
								<div className="view6">
									<span className="text4" >
										{"Event 1: Suspicious login attempt"}
									</span>
								</div>
								<div className="view6">
									<span className="text4" >
										{"Event 2: Malware detected"}
									</span>
								</div>
								<div className="view6">
									<span className="text4" >
										{"Event 3: Unauthorized access"}
									</span>
								</div>
								<div className="view6">
									<span className="text4" >
										{"Event 4: Phishing attempt"}
									</span>
								</div>
								<div className="view7">
									<span className="text4" >
										{"Event 5: Data exfiltration"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="column4">
					<div className="view2">
						<span className="text2" >
							{"Incident Reports"}
						</span>
					</div>
					<div className="column5">
						<div className="row-view2">
							<div className="view8">
								<div className="column6">
									<div className="view9">
										<span className="text5" >
											{"Incident"}
										</span>
									</div>
									<div className="view10">
										<div className="view11">
											<span className="text6" >
												{"Severity"}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="view12">
								<span className="text7" >
									{"Response Status"}
								</span>
							</div>
						</div>
						<div className="column7">
							<div className="row-view3">
								<div className="view8">
									<div className="column6">
										<div className="view13">
											<span className="text8" >
												{"Malware Attack"}
											</span>
										</div>
										<div className="view10">
											<div className="view14">
												<span className="text9" >
													{"High"}
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="view15">
									<span className="text10" >
										{"In Progress"}
									</span>
								</div>
							</div>
							<div className="row-view3">
								<div className="view8">
									<div className="column6">
										<div className="view13">
											<span className="text8" >
												{"Phishing Attempt"}
											</span>
										</div>
										<div className="view10">
											<div className="view14">
												<span className="text11" >
													{"Medium"}
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="view16">
									<span className="text10" >
										{"Resolved"}
									</span>
								</div>
							</div>
							<div className="row-view3">
								<div className="view8">
									<div className="column6">
										<div className="view13">
											<span className="text8" >
												{"Unauthorized Access"}
											</span>
										</div>
										<div className="view10">
											<div className="view14">
												<span className="text9" >
													{"High"}
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="view17">
									<span className="text10" >
										{"Pending"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="column4">
					<div className="view2">
						<span className="text2" >
							{"Action Panel"}
						</span>
					</div>
					<div className="column5">
						<div className="view18">
							<span className="text4" >
								{"Review logs for suspicious activity"}
							</span>
						</div>
						<div className="view18">
							<span className="text4" >
								{"Isolate affected systems"}
							</span>
						</div>
						<div className="view18">
							<span className="text4" >
								{"Notify relevant stakeholders"}
							</span>
						</div>
						<div className="view6">
							<span className="text4" >
								{"Update security protocols"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ThreatDash;